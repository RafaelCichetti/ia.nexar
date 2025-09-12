import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';

export function confirmAction({
  title = 'Tem certeza?',
  text = 'Esta ação não pode ser desfeita.',
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  icon = 'warning'
} = {}) {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
    confirmButtonColor: '#007bff',
    cancelButtonColor: '#6c757d',
    background: '#0c1016',
    color: '#e5ecf5',
    backdrop: 'rgba(0,0,0,0.6)'
  }).then(r => r.isConfirmed === true);
}

export function confirmDeleteEntity(nome = 'registro') {
  return confirmAction({
    title: `Excluir ${nome}?`,
    text: 'Esta ação não pode ser desfeita.',
    confirmButtonText: 'Excluir',
    cancelButtonText: 'Cancelar',
    icon: 'warning'
  });
}

export function confirmCancelAppointment(textoDetalhe) {
  return confirmAction({
    title: 'Cancelar compromisso?',
    text: textoDetalhe || 'O evento será removido da agenda.',
    confirmButtonText: 'Cancelar compromisso',
    cancelButtonText: 'Voltar',
    icon: 'warning'
  });
}
