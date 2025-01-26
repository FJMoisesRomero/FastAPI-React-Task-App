from fastapi import APIRouter, HTTPException, Depends
from models import UsuarioCreate, UsuarioInDB, UsuarioLogin, TaskCreate, TaskInDB, TaskUpdate
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime
from typing import List
import hashlib

usuario_router = APIRouter()
task_router = APIRouter()

# La conexión a MongoDB será inyectada desde main.py
db = None

@usuario_router.post("/usuarios/", response_model=UsuarioInDB)
async def crear_usuario(usuario: UsuarioCreate):
    # Verificar si el correo ya existe
    usuario_existente = await db.usuarios.find_one({"email": usuario.email})
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")

    # Hash de la contraseña
    hashed_password = hashlib.sha256(usuario.password.encode()).hexdigest()
    usuario_dict = usuario.model_dump()
    usuario_dict["password"] = hashed_password
    usuario_dict["created_at"] = datetime.now()
    usuario_dict["id"] = str(ObjectId())
    
    await db.usuarios.insert_one(usuario_dict)
    return UsuarioInDB(**usuario_dict)

@usuario_router.get("/usuarios/", response_model=List[UsuarioInDB])
async def obtener_usuarios():
    usuarios = []
    cursor = db.usuarios.find()
    async for usuario in cursor:
        usuarios.append(UsuarioInDB(**usuario))
    return usuarios

@usuario_router.post("/login/")
async def iniciar_sesion(credentials: UsuarioLogin):
    hashed_password = hashlib.sha256(credentials.password.encode()).hexdigest()
    usuario = await db.usuarios.find_one({"email": credentials.email, "password": hashed_password})
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return {"id": str(usuario["id"]), "username": usuario["username"]}

@task_router.post("/tasks/", response_model=TaskInDB)
async def crear_tarea(task: TaskCreate):
    # Verificar si el usuario existe
    usuario = await db.usuarios.find_one({"id": task.usuario_id})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    task_dict = task.model_dump()
    task_dict["created_at"] = datetime.now()
    task_dict["id"] = str(ObjectId())
    
    await db.tasks.insert_one(task_dict)
    return TaskInDB(**task_dict)

@task_router.get("/tasks/", response_model=List[TaskInDB])
async def obtener_tareas():
    tareas = []
    cursor = db.tasks.find()
    async for tarea in cursor:
        tareas.append(TaskInDB(**tarea))
    return tareas

@task_router.get("/tasks/user/{usuario_id}", response_model=List[TaskInDB])
async def obtener_tareas_usuario(usuario_id: str):
    # Verificar si el usuario existe
    usuario = await db.usuarios.find_one({"id": usuario_id})
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    tareas = []
    cursor = db.tasks.find({"usuario_id": usuario_id})
    async for tarea in cursor:
        tareas.append(TaskInDB(**tarea))
    return tareas

@task_router.put("/tasks/{task_id}", response_model=TaskInDB)
async def actualizar_tarea(task_id: str, task_update: TaskUpdate):
    # Verificar si la tarea existe
    tarea_existente = await db.tasks.find_one({"id": task_id})
    if not tarea_existente:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    update_data = {k: v for k, v in task_update.model_dump().items() if v is not None}
    
    if update_data:
        result = await db.tasks.update_one(
            {"id": task_id},
            {"$set": update_data}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    tarea_actualizada = await db.tasks.find_one({"id": task_id})
    return TaskInDB(**tarea_actualizada)

@task_router.delete("/tasks/{task_id}")
async def eliminar_tarea(task_id: str):
    # Verificar si la tarea existe
    tarea_existente = await db.tasks.find_one({"id": task_id})
    if not tarea_existente:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return {"mensaje": "Tarea eliminada exitosamente"}
