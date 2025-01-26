from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime



class UsuarioBase(BaseModel):
    username: str
    email: str
    password: str

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioLogin(BaseModel):
    email: str
    password: str

class UsuarioInDB(UsuarioBase):
    id: str
    created_at: datetime = datetime.now()

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: str
    status: str = "pendiente"  # pendiente, en_progreso, completada
    usuario_id: str

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class TaskInDB(TaskBase):
    id: str
    created_at: datetime = datetime.now()

    class Config:
        from_attributes = True
