import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

export function useProjectCollections(companyId, projectId) {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    if (!companyId || !projectId) return;

    const docsQ = query(collection(db, 'companies', companyId, 'projects', projectId, 'documentTypes'), orderBy('name', 'asc'));
    const subQ = query(collection(db, 'companies', companyId, 'projects', projectId, 'submissions'), orderBy('createdAt', 'desc'));

    const unsub1 = onSnapshot(docsQ, (snapshot) => {
      setDocumentTypes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsub2 = onSnapshot(subQ, (snapshot) => {
      setSubmissions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [companyId, projectId]);

  const createDocumentType = async (payload) => {
    await addDoc(collection(db, 'companies', companyId, 'projects', projectId, 'documentTypes'), {
      ...payload,
      active: true,
      createdAt: serverTimestamp(),
    });
  };

  const deleteDocumentType = async (documentTypeId) => {
    const relatedSubmissions = submissions.filter(sub => sub.documentTypeId === documentTypeId);
    await Promise.all(relatedSubmissions.map(sub => 
      deleteDoc(doc(db, 'companies', companyId, 'projects', projectId, 'submissions', sub.id))
    ));
    await deleteDoc(doc(db, 'companies', companyId, 'projects', projectId, 'documentTypes', documentTypeId));
  };

  const uploadSubmissionFile = async (documentTypeId, file) => {
    const fileRef = ref(storage, `companies/${companyId}/projects/${projectId}/documents/${documentTypeId}/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const saveSubmission = async (existingId, payload) => {
    if (existingId) {
      await updateDoc(doc(db, 'companies', companyId, 'projects', projectId, 'submissions', existingId), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      return;
    }

    await addDoc(collection(db, 'companies', companyId, 'projects', projectId, 'submissions'), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const deleteSubmission = async (submissionId) => {
    await deleteDoc(doc(db, 'companies', companyId, 'projects', projectId, 'submissions', submissionId));
  };

  return { documentTypes, submissions, createDocumentType, deleteDocumentType, saveSubmission, uploadSubmissionFile, deleteSubmission };
}
