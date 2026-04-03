import { useEffect, useState } from 'react';
import { today } from '../utils/format';

const DELIVERY_CHANNELS = ['Email', 'Correo postal', 'Plataforma CAE', 'Entrega en mano', 'WhatsApp', 'Portal del cliente', 'Otro'];

export function SubmissionDialog({ open, onOpenChange, docType, currentUser, existingSubmission, saveSubmission, uploadSubmissionFile }) {
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    delivered: true,
    approvedByClient: false,
    approvalDate: '',
    deliveryDate: today(),
    channel: 'Email',
    reference: '',
    fileName: '',
    fileUrl: '',
  });

  useEffect(() => {
    setForm({
      delivered: existingSubmission?.delivered ?? true,
      approvedByClient: existingSubmission?.approvedByClient ?? false,
      approvalDate: existingSubmission?.approvalDate || '',
      deliveryDate: existingSubmission?.deliveryDate || today(),
      channel: existingSubmission?.channel || 'Email',
      reference: existingSubmission?.reference || '',
      fileName: existingSubmission?.fileName || '',
      fileUrl: existingSubmission?.fileUrl || '',
    });
    setFile(null);
  }, [existingSubmission, open]);

  if (!open || !docType) return null;

  const submit = async () => {
    setSaving(true);
    try {
      let uploadedFileUrl = form.fileUrl || '';
      let uploadedFileName = form.fileName || '';
      if (file) {
        uploadedFileUrl = await uploadSubmissionFile(docType.id, file);
        uploadedFileName = file.name;
      }
      await saveSubmission(existingSubmission?.id, {
        documentTypeId: docType.id,
        submittedBy: currentUser.id,
        delivered: form.delivered,
        approvedByClient: form.approvedByClient,
        approvalDate: form.approvalDate,
        deliveryDate: form.deliveryDate,
        channel: form.channel,
        reference: form.reference,
        fileName: uploadedFileName,
        fileUrl: uploadedFileUrl,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error guardando registro:", error);
      alert("Hubo un error al guardar el registro: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal card">
        <h3>Registrar entrega</h3>
        <p><strong>{docType.name}</strong> · {docType.category}</p>
        <label className="check"><input type="checkbox" checked={form.delivered} onChange={(e) => setForm((p) => ({ ...p, delivered: e.target.checked }))} /> Documentación presentada</label>
        <label className="check"><input type="checkbox" checked={form.approvedByClient} onChange={(e) => setForm((p) => ({ ...p, approvedByClient: e.target.checked, approvalDate: e.target.checked ? (p.approvalDate || today()) : '' }))} /> Aprobada por el cliente</label>
        <div className="form-grid">
          <input type="date" value={form.deliveryDate} onChange={(e) => setForm((p) => ({ ...p, deliveryDate: e.target.value }))} />
          <input type="date" value={form.approvalDate} onChange={(e) => setForm((p) => ({ ...p, approvalDate: e.target.value, approvedByClient: Boolean(e.target.value) }))} />
          <select value={form.channel} onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}>
            {DELIVERY_CHANNELS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <input placeholder="Nombre del archivo / referencia" value={form.fileName} onChange={(e) => setForm((p) => ({ ...p, fileName: e.target.value }))} />
        <textarea placeholder="Observaciones" value={form.reference} onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))} />
        <div className="actions">
          <button className="secondary" onClick={() => onOpenChange(false)}>Cancelar</button>
          <button onClick={submit} disabled={saving}>{saving ? 'Guardando...' : 'Guardar registro'}</button>
        </div>
      </div>
    </div>
  );
}
