import { useEffect, useMemo, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useProjects } from '../hooks/useProjects';
import { useProjectCollections } from '../hooks/useProjectCollections';
import { formatDate, formatDateTime } from '../utils/format';
import { ProjectFormDialog } from './ProjectFormDialog';
import { AddDocumentTypeDialog } from './AddDocumentTypeDialog';
import { SubmissionDialog } from './SubmissionDialog';

const ROLE_LABELS = { admin: 'Administrador', tech: 'Técnico', viewer: 'Consulta' };

export function AppShell({ user }) {
  const { projects, createProject, updateProject, deleteProject } = useProjects(user.companyId);
  const [projectQuery, setProjectQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => [p.code, p.name, p.client, p.location].join(' ').toLowerCase().includes(projectQuery.toLowerCase()))
      .filter((p) => statusFilter === 'all' ? true : p.status === statusFilter);
  }, [projects, projectQuery, statusFilter]);

  const selectedProject = useMemo(
    () => filteredProjects.find((p) => p.id === selectedProjectId) || projects.find((p) => p.id === selectedProjectId) || filteredProjects[0] || null,
    [filteredProjects, projects, selectedProjectId]
  );

  useEffect(() => {
    if (!selectedProjectId && filteredProjects[0]) setSelectedProjectId(filteredProjects[0].id);
  }, [filteredProjects, selectedProjectId]);

  const { documentTypes, submissions, createDocumentType, deleteDocumentType, saveSubmission, uploadSubmissionFile, deleteSubmission } = useProjectCollections(user.companyId, selectedProject?.id);

  const latestByDocument = useMemo(() => {
    const map = new Map();
    for (const item of submissions) if (!map.has(item.documentTypeId)) map.set(item.documentTypeId, item);
    return map;
  }, [submissions]);

  const checklistRows = useMemo(() => documentTypes.filter((d) => d.active !== false).map((docType) => ({ ...docType, submission: latestByDocument.get(docType.id) || null })), [documentTypes, latestByDocument]);

  const requiredCount = checklistRows.filter((r) => r.required).length;
  const approvedRequiredCount = checklistRows.filter((r) => r.required && r.submission?.approvedByClient).length;
  const progress = requiredCount ? Math.round((approvedRequiredCount / requiredCount) * 100) : 0;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Activa': return 'success';
      case 'Finalizada': return 'dark';
      case 'Bloqueada': return 'danger';
      case 'Pendiente inicio': return 'warning';
      default: return 'outline';
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div>
            <h2>DocObra Control</h2>
            <p>Gestión documental</p>
          </div>
          <button className="secondary" onClick={() => signOut(auth)}>Salir</button>
        </div>

        <div className="card user-box">
          <strong>{user.name}</strong>
          <span>{ROLE_LABELS[user.role] || user.role}</span>
        </div>

        <div className="filters card">
          <input placeholder="Buscar obra..." value={projectQuery} onChange={(e) => setProjectQuery(e.target.value)} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="Activa">Activa</option>
            <option value="Pendiente inicio">Pendiente inicio</option>
            <option value="Finalizada">Finalizada</option>
            <option value="Bloqueada">Bloqueada</option>
          </select>
          {user.role === 'admin' ? (
            <>
              <ProjectFormDialog user={user} createProject={createProject} />
              {selectedProject && (
                <ProjectFormDialog 
                  key={`edit-${selectedProject.id}`}
                  user={user} 
                  projectToEdit={selectedProject} 
                  updateProject={updateProject} 
                />
              )}
            </>
          ) : null}
        </div>

        <div className="project-list">
          {filteredProjects.map((project) => (
            <button key={project.id} className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`} onClick={() => setSelectedProjectId(project.id)}>
              <small>{project.code}</small>
              <strong>{project.name}</strong>
              <span>{project.client}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="content">
        {!selectedProject ? <div className="card">Selecciona o crea una obra.</div> : (
          <>
            <section className="card header-card">
              <div>
                <div className="badge-row">
                  <span className="badge">{selectedProject.code}</span>
                  {user.role === 'admin' ? (
                    <select 
                      className={`badge ${getStatusColor(selectedProject.status)}`}
                      value={selectedProject.status || 'Activa'}
                      onChange={(e) => updateProject(selectedProject.id, { status: e.target.value })}
                    >
                      <option value="Activa">Activa</option>
                      <option value="Pendiente inicio">Pendiente inicio</option>
                      <option value="Finalizada">Finalizada</option>
                      <option value="Bloqueada">Bloqueada</option>
                    </select>
                  ) : (
                    <span className={`badge ${getStatusColor(selectedProject.status)}`}>
                      {selectedProject.status}
                    </span>
                  )}
                  <span className="badge outline">{selectedProject.location || 'Sin ubicación'}</span>
                </div>
                <h1>{selectedProject.name}</h1>
                <p>Cliente: {selectedProject.client || '—'}</p>
                {user.role === 'admin' && (
                  <button 
                    className="danger" 
                    style={{ marginTop: '12px', padding: '6px 14px', fontSize: '13px' }} 
                    onClick={() => {
                      if (confirm('¿Eliminar esta obra por completo? Esto no se puede deshacer.')) {
                        deleteProject(selectedProject.id);
                        setSelectedProjectId(null);
                      }
                    }}
                  >
                    Eliminar obra
                  </button>
                )}
              </div>
              <div className="progress-box">
                <div className="progress-header"><span>Cumplimiento documental</span><strong>{progress}%</strong></div>
                <div className="progress"><div style={{ width: `${progress}%` }} /></div>
                <div className="metrics">
                  <div className="metric"><small>Obligatorios</small><strong>{requiredCount}</strong></div>
                  <div className="metric"><small>Aprobados</small><strong>{approvedRequiredCount}</strong></div>
                  <div className="metric"><small>Pendientes</small><strong>{requiredCount - approvedRequiredCount}</strong></div>
                </div>
              </div>
            </section>

            <section className="two-cols">
              <div className="card">
                <div className="section-head">
                  <div>
                    <h3>Checklist documental</h3>
                    <p>Entrega y aprobación por cliente</p>
                  </div>
                  <AddDocumentTypeDialog createDocumentType={createDocumentType} />
                </div>
                <div className="list-rows">
                  {checklistRows.map((row) => (
                    <div key={row.id} className="row-card">
                      <div>
                        <div className="title-row">
                          <strong>{row.name}</strong>
                          {row.required ? <span className="badge">Obligatorio</span> : null}
                          <span className="badge outline">{row.category}</span>
                        </div>
                        <p>{row.notes || 'Sin observaciones'}</p>
                      </div>
                      <div>
                        <small>Fecha aportación</small>
                        <strong>{row.submission?.deliveryDate ? formatDate(row.submission.deliveryDate) : 'Pendiente'}</strong>
                      </div>
                      <div>
                        <small>Medio</small>
                        <strong>{row.submission?.channel || '—'}</strong>
                      </div>
                      <div className="actions-end">
                        <span className={`badge ${row.submission?.delivered ? '' : 'outline'}`}>{row.submission?.delivered ? 'Entregado' : 'No entregado'}</span>
                        <span className={`badge ${row.submission?.approvedByClient ? '' : 'outline'}`}>{row.submission?.approvedByClient ? 'Aprobado cliente' : 'Sin aprobar'}</span>
                        <button className="secondary" onClick={() => { setSelectedDocType(row); setSubmissionOpen(true); }}>Registrar</button>
                        <button className="danger" onClick={() => deleteDocumentType(row.id)}>Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3>Historial de entregas</h3>
                <div className="list-rows">
                  {submissions.map((item) => {
                    const docType = documentTypes.find((d) => d.id === item.documentTypeId);
                    return (
                      <div key={item.id} className="row-card stacked">
                        <div>
                          <strong>{docType?.name || 'Documento eliminado'}</strong>
                          <p>{docType?.category || '—'}</p>
                          <p>{item.reference || 'Sin observaciones'}</p>
                        </div>
                        <div>
                          <div>Estado: <strong>{item.delivered ? 'Entregado' : 'Pendiente'}</strong></div>
                          <div>Aprobación cliente: <strong>{item.approvedByClient ? 'Sí' : 'No'}</strong></div>
                          <div>Fecha entrega: {formatDate(item.deliveryDate)}</div>
                          <div>Fecha aprobación: {formatDate(item.approvalDate)}</div>
                          <div>Medio: {item.channel || '—'}</div>
                          <div>Archivo: {item.fileUrl ? <a href={item.fileUrl} target="_blank" rel="noreferrer">{item.fileName || 'Abrir archivo'}</a> : (item.fileName || '—')}</div>
                          <div>Creado: {formatDateTime(item.createdAt)}</div>
                          {user.role === 'admin' && (
                            <button 
                              className="danger" 
                              style={{ marginTop: '12px', padding: '6px 14px', fontSize: '13px' }} 
                              onClick={() => {
                                if (confirm('¿Eliminar este registro permanentemente del historial?')) {
                                  deleteSubmission(item.id);
                                }
                              }}
                            >
                              Eliminar registro
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <SubmissionDialog
        open={submissionOpen}
        onOpenChange={setSubmissionOpen}
        docType={selectedDocType}
        currentUser={user}
        existingSubmission={selectedDocType ? latestByDocument.get(selectedDocType.id) : null}
        saveSubmission={saveSubmission}
        uploadSubmissionFile={uploadSubmissionFile}
      />
    </div>
  );
}
