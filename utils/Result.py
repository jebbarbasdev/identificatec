from typing import TypeVar, Generic
from flask import jsonify

T = TypeVar('T')

class Result(Generic[T]):
    def __init__(self, status: int, message: str, data: T):
        self.status = status
        self.message = message
        self.data = data

    def dto(self):
        return { 'status': self.status, 'message': self.message, 'data': self.data }

    @staticmethod
    def create(status: int, message: str, data: T):
        result = Result(status, message, data)
        return jsonify(result.dto()), status

    @staticmethod
    def from_ok():
        return Result.create(200, 'OK', None)
    
    @staticmethod
    def from_data(data):
        return Result.create(200, 'OK', data)

    @staticmethod
    def from_exception(ex: Exception):
        return Result.create(500, str(ex), None)
    
    @staticmethod
    def from_created():
        return Result.create(201, 'OK', None)
    
    @staticmethod
    def from_not_found(message: str):
        return Result.create(404, message, None)
        