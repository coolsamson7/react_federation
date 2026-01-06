from abc import abstractmethod

from pydantic import BaseModel

from aspyx_event import event
from aspyx_service import service, Service, rest, post, Body

@event(durable=False) # broadcast???
class ChatMessage(BaseModel):
    content: str
    questionId: str = ""

class ChatQuestion(BaseModel):
    question: str

@service(name="chat-service", description="chat stuff")
@rest("/api/chat/")
class ChatService(Service):
    """
    The portal service exposes portal data.
    """

    @abstractmethod
    def answer(self, question: ChatQuestion, answer: str):
        pass

    @abstractmethod
    @post("question")
    def ask(self, request: Body(ChatQuestion)) -> ChatQuestion:
        pass




