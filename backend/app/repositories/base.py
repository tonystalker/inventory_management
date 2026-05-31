from typing import TypeVar, Generic, Optional, List, Type
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

T = TypeVar("T")

class BaseRepository(Generic[T]):
    def __init__(self, db: Session, model: Type[T]):
        self.db = db
        self.model = model

    def get_by_id(self, id: int) -> Optional[T]:
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(self) -> List[T]:
        return self.db.query(self.model).all()

    def create(self, data: dict) -> T:
        entity = self.model(**data)
        self.db.add(entity)
        try:
            self.db.commit()
            self.db.refresh(entity)
        except IntegrityError:
            self.db.rollback()
            raise
        return entity

    def update(self, entity: T, data: dict) -> T:
        for key, value in data.items():
            if value is not None:
                setattr(entity, key, value)
        try:
            self.db.commit()
            self.db.refresh(entity)
        except IntegrityError:
            self.db.rollback()
            raise
        return entity

    def delete(self, id: int) -> bool:
        entity = self.get_by_id(id)
        if not entity:
            return False
        self.db.delete(entity)
        self.db.commit()
        return True
