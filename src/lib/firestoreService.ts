import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { ArchivedProject, ProjectTemplate } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firestoreService = {
  async saveProject(project: ArchivedProject) {
    const path = `projects/${project.id}`;
    try {
      await setDoc(doc(db, 'projects', project.id), {
        ...project,
        uid: auth.currentUser?.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteProject(projectId: string) {
    const path = `projects/${projectId}`;
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateProjectStatus(projectId: string, status: string) {
    const path = `projects/${projectId}`;
    try {
      await updateDoc(doc(db, 'projects', projectId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  subscribeToProjects(callback: (projects: ArchivedProject[]) => void) {
    if (!auth.currentUser) return () => {};
    const path = 'projects';
    const q = query(collection(db, 'projects'), where('uid', '==', auth.currentUser.uid));
    
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => doc.data() as ArchivedProject);
      callback(projects);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async saveTemplate(template: ProjectTemplate) {
    const path = `templates/${template.id}`;
    try {
      await setDoc(doc(db, 'templates', template.id), {
        ...template,
        createdBy: auth.currentUser?.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteTemplate(templateId: string) {
    const path = `templates/${templateId}`;
    try {
      await deleteDoc(doc(db, 'templates', templateId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeToTemplates(callback: (templates: ProjectTemplate[]) => void) {
    const path = 'templates';
    return onSnapshot(collection(db, 'templates'), (snapshot) => {
      const templates = snapshot.docs.map(doc => doc.data() as ProjectTemplate);
      callback(templates);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }
};
