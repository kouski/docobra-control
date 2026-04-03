import { useState } from 'react';
import { today } from '../utils/format';

export function ProjectFormDialog({ user, createProject }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: '', name: '', client: '', location: '', status: 'Activa', startDate: today(), endDate: ''
  });

  const change = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async () => {
    if (!form.code || !form.name) return;
    await createProject({ ...form, createdBy: user.id });
    setOpen(false);
    setForm({ code: '', name: '', client: '', location: '', status: 'Activa', startDate: today(), endDate: '' });
  };

  if (!open) {
    return <button onClick={() => setOpen(true)}>+ Nueva obra</button>;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal card">
        <h3>Crear obra</h3>
        <div className="form-grid">
          <input placeholder="Código" value={form.code} onChange={(e) => change('code', e.target.value)} />
          <select value={form.status} onChange={(e) => change('status', e.target.value)}>
            <option>Activa</option><option>Pendiente inicio</option><option>Finalizada</option><option>Bloqueada</option>
          </select>
          <input placeholder="Nombre de la obra" value={form.name} onChange={(e) => change('name', e.target.value)} />
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
