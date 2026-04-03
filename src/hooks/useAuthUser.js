import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export function useAuthUser() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Obteniendo perfil de Firestore para el usuario:', user.uid);
        // Usamos Promise.race para evitar que la app se quede colgada infinitamente si Firestore no responde o no está creado
        const snap = await Promise.race([
          getDoc(doc(db, 'users', user.uid)),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout conectando a Firestore. ¿Está la base de datos creada?')), 5000))
        ]);
        
        if (snap.exists()) {
          setProfile({ id: snap.id, ...snap.data() });
        } else {
          const newProfile = {
            name: user.displayName || user.email,
            email: user.email,
            role: 'admin',
            companyId: 'default-company',
            createdAt: new Date().toISOString()
          };
          
          try {
            await setDoc(doc(db, 'users', user.uid), newProfile);
            console.log('Usuario auto-registrado en Firestore');
          } catch (e) {
            console.warn('No se pudo guardar el usuario en Firestore automáticamente', e);
          }
          
          setProfile({
            id: user.uid,
            ...newProfile
          });
        }
      } catch (error) {
        console.error("Error fetching user profile from Firestore:", error);
        // Fallback profile if Firestore fails
        setProfile({
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
          role: 'viewer',
          companyId: 'default-company',
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { profile, loading };
}
