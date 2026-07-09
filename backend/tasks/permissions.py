from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsTaskOwnerOrReadOnly(BasePermission):
    """
    Permite leitura para usuários que receberam a tarefa compartilhada,
    mas somente o proprietário pode alterar ou excluir.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return obj.owner == request.user or obj.shared_with.filter(
                id=request.user.id
            ).exists()

        return obj.owner == request.user