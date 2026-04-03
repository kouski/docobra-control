import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useProjects(companyId) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!companyId) return;
    const q = query(collection(db, 'companies', companyId, 'projects'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [companyId]);

  const createProject = async (payload) => {
    await addDoc(collection(db, 'companies', companyId, 'projects'), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateProject = async (projectId, patch) => {
    await updateDoc(doc(db, 'companies', companyId, 'projects', projectId), {
      ...patch,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteProject = async (projectId) => {
    await deleteDoc(doc(db, 'companies', companyId, 'projects', projectId));
  };

  return { projects, createProject, updateProject, deleteProject };
}
