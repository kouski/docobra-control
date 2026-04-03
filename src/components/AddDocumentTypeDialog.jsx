import { useState } from 'react';

const DOC_CATEGORIES = ['Empresa', 'Trabajadores', 'Maquinaria', 'Seguridad y salud', 'Subcontratas', 'Calidad', 'Medio ambiente', 'Seguridad Operacional', 'Otros'];

export function AddDocumentTypeDialog({ createDocumentType }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Empresa', required: true, notes: '' });

  const submit = async () => {
    if (!form.name.trim()) return;
    await createDocumentType(form);
    setOpen(false);
    setForm({ name: '', category: 'Empresa', required: true, notes: '' });
  };

  if (!open) return <button onClick={() => setOpen(true)}>+ Añadir documento</button>;

  return (
    <div className="modal-backdrop">
      <div className="modal card">
        <h3>Nuevo tipo documental</h3>
        <input placeholder="Nombre del documento" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
          {DOC_CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
        </select>
        <textarea placeholder="Observaciones" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
        <label className="check"><input type="checkbox" checked={form.required} onChange={(e) => setForm((p) => ({ ...p, required: e.target.checked }))} /> Documento obligatorio</label>
        <div className="actions">
          <button className="secondary" onClick={() => setOpen(false)}>Cancelar</button>
          <button onClick={submit}>Guardar</button>
        </div>
      </div>
    </div>
  );
}
