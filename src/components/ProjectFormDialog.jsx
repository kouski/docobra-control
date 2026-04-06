import { useState } from 'react';
import { today } from '../utils/format';

export function ProjectFormDialog({ user, createProject, projectToEdit, updateProject }) {
  const [open, setOpen] = useState(false);
  const isEditing = !!projectToEdit;
  const [form, setForm] = useState({
    code: '', name: '', client: '', location: '', status: 'Activa', startDate: today(), endDate: ''
  });

  const handleOpen = () => {
    if (isEditing) {
      setForm({
        code: projectToEdit.code || '',
        name: projectToEdit.name || '',
        client: projectToEdit.client || '',
        location: projectToEdit.location || '',
        status: projectToEdit.status || 'Activa',
        startDate: projectToEdit.startDate || '',
        endDate: projectToEdit.endDate || ''
      });
    } else {
      setForm({ code: '', name: '', client: '', location: '', status: 'Activa', startDate: today(), endDate: '' });
    }
    setOpen(true);
  };

  const change = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.code || !form.name) return;
    setLoading(true);
    try {
      if (isEditing) {
        await updateProject(projectToEdit.id, { ...form });
      } else {
        await createProject({ ...form, createdBy: user.id });
      }
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error al guardar la obra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button className={isEditing ? 'secondary' : ''} onClick={handleOpen}>
        {isEditing ? 'Editar obra / admin.' : '+ Nueva obra'}
      </button>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal card">
        <h3>{isEditing ? 'Editar obra' : 'Crear obra'}</h3>
        <div className="form-grid">
          <input placeholder="Código *" value={form.code} onChange={(e) => change('code', e.target.value)} />
          <select value={form.status} onChange={(e) => change('status', e.target.value)}>
            <option>Activa</option><option>Pendiente inicio</option><option>Finalizada</option><option>Bloqueada</option>
          </select>
          <input placeholder="Nombre de la obra *" value={form.name} onChange={(e) => change('name', e.target.value)} />
          <input placeholder="Cliente" value={form.client} onChange={(e) => change('client', e.target.value)} />
          <input placeholder="Ubicación" value={form.location} onChange={(e) => change('location', e.target.value)} />
          <input type="date" value={form.startDate} onChange={(e) => change('startDate', e.target.value)} />
          <input type="date" value={form.endDate} onChange={(e) => change('endDate', e.target.value)} />
        </div>
        <div className="actions">
          <button className="secondary" onClick={() => setOpen(false)}>Cancelar</button>
          <button onClick={submit}>Guardar obra</button>
        </div>
      </div>
    </div>
  );
}
