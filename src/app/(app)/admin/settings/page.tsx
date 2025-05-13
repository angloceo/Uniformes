
"use client";

import { useState, useEffect, type FormEvent, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { initialUniforms, type Uniform } from '@/lib/mock-data'; // Uniforms still from mock/localStorage
import { Settings2, Save, AlertCircle, Edit3, ImageIcon, Users2, UserPlus, Trash2, Mail, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { siteConfig } from '@/config/site';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateEmail as firebaseUpdateEmail, sendPasswordResetEmail, onAuthStateChanged, updatePassword as firebaseUpdatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';

interface AppUser {
  id: string; // Firebase Auth UID
  username: string;
  email: string;
  role: 'admin' | 'secretary';
  // No hashed_password here, Firebase Auth handles it
}

const PASSWORD_POLICY_TEXT = "La contraseña debe tener al menos 8 caracteres. Para mayor seguridad, incluya mayúsculas, minúsculas, números y un símbolo (ej: !@#$%).";

function isLocalStorageAvailable(): boolean { // Keep for uniform data for now
  try {
    const testKey = '__testLocalStorage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  // Uniforms state - still uses localStorage
  const [uniformTypes, setUniformTypes] = useState<Uniform[]>([]);
  const [editedUniformTypes, setEditedUniformTypes] = useState<Uniform[]>([]);
  const [hasUniformChanges, setHasUniformChanges] = useState(false);
  const [localStorageAvailable, setLocalStorageAvailable] = useState(true); // For uniforms

  // User management state - uses Firebase
  const [appUsers, setAppUsers] = useState<AppUser[]>([]); // Users from Firestore
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [addUserFormState, setAddUserFormState] = useState({ username: '', email: '', password_plaintext: '', role: 'secretary' as 'admin' | 'secretary' });
  const [editUserFormState, setEditUserFormState] = useState<AppUser & { new_password_plaintext?: string, current_password_for_reauth?: string }>({ id: '', username: '', email: '', role: 'secretary', new_password_plaintext: '', current_password_for_reauth: '' });
  
  const [currentUser, setCurrentUser] = useState<firebase.default.User | null>(null); // Firebase Auth user
  const [currentUserAppRole, setCurrentUserAppRole] = useState<'admin' | 'secretary' | null>(null);


  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true); // General loading for page
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storageAvailable = isLocalStorageAvailable();
    setLocalStorageAvailable(storageAvailable);

    if (!storageAvailable) { // For uniforms
        toast({ title: "Advertencia de Almacenamiento (Uniformes)", description: "El almacenamiento local no está disponible. Los cambios en tipos de prendas no se guardarán.", variant: "destructive", duration: 7000 });
    }

    // Firebase Auth observer
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentUserAppRole(userDocSnap.data().role as 'admin' | 'secretary');
        } else {
          // This should not happen for a logged-in user, means Firestore doc is missing
          setCurrentUserAppRole(null);
          toast({ title: "Error de Usuario", description: "No se encontró el rol del usuario actual.", variant: "destructive" });
        }
      } else {
        setCurrentUser(null);
        setCurrentUserAppRole(null);
        // router.push('/login'); // Handled by AppLayout
      }
      setLoading(prev => ({...prev, auth:false}));
    });

    // Firestore Users listener
    const usersQuery = query(collection(db, "users"));
    const unsubscribeFirestoreUsers = onSnapshot(usersQuery, (querySnapshot) => {
      const usersData: AppUser[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as AppUser);
      });
      setAppUsers(usersData);
      setLoadingUsers(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "No se pudieron cargar los usuarios.", variant: "destructive" });
      setLoadingUsers(false);
    });
    
    // Load Uniforms from localStorage (remains unchanged for now)
    let liveUniformsData: Uniform[];
    if (storageAvailable) {
      const storedUniformsRaw = localStorage.getItem('updatedUniformsData');
      liveUniformsData = storedUniformsRaw ? JSON.parse(storedUniformsRaw) : JSON.parse(JSON.stringify(initialUniforms));
      if(!storedUniformsRaw) localStorage.setItem('updatedUniformsData', JSON.stringify(liveUniformsData));
    } else {
      liveUniformsData = JSON.parse(JSON.stringify(initialUniforms));
    }
    setUniformTypes(liveUniformsData);
    setEditedUniformTypes(JSON.parse(JSON.stringify(liveUniformsData)));

    setLoading(false); // General page loading

    return () => {
      unsubscribeAuth();
      unsubscribeFirestoreUsers();
    };
  }, [mounted, toast]);

  // Uniform management handlers (remain localStorage based)
  const handleUniformInputChange = (id: string, field: 'name' | 'category', value: string) => {
    setEditedUniformTypes(currentTypes => currentTypes.map(uniType => uniType.id === id ? { ...uniType, [field]: value } : uniType));
    setHasUniformChanges(true);
  };
  const handleSaveUniformChanges = () => {
    if (!editedUniformTypes.every(uni => uni.name.trim() !== "" && uni.category.trim() !== "")) {
      toast({ title: "Error de Validación", description: "El nombre y la categoría de la prenda no pueden estar vacíos.", variant: "destructive" });
      return;
    }
    if (!localStorageAvailable) {
        toast({ title: "Guardado Deshabilitado", description: "El almacenamiento local no está disponible. Los cambios en uniformes no se pueden guardar.", variant: "destructive" });
        return;
    }
    localStorage.setItem('updatedUniformsData', JSON.stringify(editedUniformTypes));
    setUniformTypes(JSON.parse(JSON.stringify(editedUniformTypes)));
    toast({ title: "Cambios Guardados", description: "Los tipos de prendas han sido actualizados." });
    setHasUniformChanges(false);
  };


  // User Management Handlers (Firebase)
  const handleOpenAddUserDialog = () => {
    if (currentUserAppRole !== 'admin') return;
    setAddUserFormState({ username: '', email: '', password_plaintext: '', role: 'secretary' });
    setIsAddUserDialogOpen(true);
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Basic password policy for frontend feedback (Firebase has its own)
  const isStrongPassword = (password: string) => password.length >= 8; // Simplified for example

  const handleAddNewUser = async (e: FormEvent) => {
    e.preventDefault();
    if (currentUserAppRole !== 'admin' || !currentUser) {
      toast({ title: "Permiso Denegado", variant: "destructive" });
      return;
    }
    
    const { username, email, password_plaintext, role } = addUserFormState;

    if (!username.trim() || !password_plaintext.trim() || !email.trim()) {
      toast({ title: "Campos Requeridos", description: "Nombre de usuario, email y contraseña son obligatorios.", variant: "destructive" });
      return;
    }
    if (!isValidEmail(email.trim())) {
      toast({ title: "Email Inválido", description: "El formato del email es incorrecto.", variant: "destructive" });
      return;
    }
    if (!isStrongPassword(password_plaintext)) {
      toast({ title: "Contraseña Débil", description: PASSWORD_POLICY_TEXT, variant: "destructive" });
      return;
    }
    // Check if username or email already exists in Firestore users (appUsers state)
    if (appUsers.some(user => user.username.toLowerCase() === username.trim().toLowerCase())) {
      toast({ title: "Error", description: "El nombre de usuario ya existe.", variant: "destructive" });
      return;
    }
    if (appUsers.some(user => user.email.toLowerCase() === email.trim().toLowerCase())) {
      toast({ title: "Error", description: "El email ya está registrado.", variant: "destructive" });
      return;
    }

    try {
      // Create user in Firebase Auth (this doesn't log them in, just creates)
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password_plaintext);
      const newUserAuth = userCredential.user;

      // Add user details to Firestore
      const newUserDocRef = doc(db, "users", newUserAuth.uid);
      await setDoc(newUserDocRef, {
        username: username.trim(),
        email: email.trim().toLowerCase(), // Store email in lowercase for consistency
        role: role,
      });
      
      // Firebase Auth handles password hashing. No need to send activation email for this flow.
      // If email verification is desired, use `sendEmailVerification(newUserAuth)`.

      toast({ title: "Usuario Creado", description: `Usuario ${username.trim()} creado exitosamente.` });
      setIsAddUserDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast({ title: "Error", description: "Este email ya está registrado en el sistema de autenticación.", variant: "destructive" });
      } else if (error.code === 'auth/weak-password') {
        toast({ title: "Contraseña Débil", description: "La contraseña proporcionada es demasiado débil.", variant: "destructive" });
      } else {
        toast({ title: "Error al Crear Usuario", description: error.message, variant: "destructive" });
      }
    }
  };
  
  const handleOpenEditUserDialog = (userToEdit: AppUser) => {
    if (currentUserAppRole === 'admin' || (currentUserAppRole === 'secretary' && userToEdit.id === currentUser?.uid)) {
        setEditUserFormState({ ...userToEdit, new_password_plaintext: '', current_password_for_reauth: '' });
        setIsEditUserDialogOpen(true);
    } else {
        toast({title: "Acceso Denegado", description: "No tienes permiso para editar este usuario.", variant: "destructive"})
    }
  };

  const handleUpdateEditedUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const { id, username, email, new_password_plaintext, role, current_password_for_reauth } = editUserFormState;

    if (!username.trim() || !email.trim()) {
      toast({ title: "Error", description: "Nombre de usuario y email son requeridos.", variant: "destructive" });
      return;
    }
    if (!isValidEmail(email.trim())) {
      toast({ title: "Email Inválido", description: "El formato del email es incorrecto.", variant: "destructive" });
      return;
    }
    // Check for unique username/email if changed
    const originalUser = appUsers.find(u => u.id === id);
    if (originalUser && username.trim().toLowerCase() !== originalUser.username.toLowerCase() && appUsers.some(user => user.id !== id && user.username.toLowerCase() === username.trim().toLowerCase())) {
      toast({ title: "Error", description: "El nombre de usuario ya existe.", variant: "destructive" });
      return;
    }
    if (originalUser && email.trim().toLowerCase() !== originalUser.email.toLowerCase() && appUsers.some(user => user.id !== id && user.email.toLowerCase() === email.trim().toLowerCase())) {
      toast({ title: "Error", description: "El email ya está registrado por otro usuario.", variant: "destructive" });
      return;
    }

    try {
      const userDocRef = doc(db, "users", id);
      // Update Firestore document (username, role)
      const firestoreUpdateData: Partial<AppUser> = { username: username.trim() };
      if (currentUserAppRole === 'admin' && id !== currentUser.uid) { // Admin can change role of others
        firestoreUpdateData.role = role;
      }
      if (currentUserAppRole === 'admin' && id === currentUser.uid && role !== 'admin') {
        toast({ title: "Acción no Permitida", description: "Un administrador no puede cambiar su propio rol a secretaria.", variant: "destructive" });
        return; // Prevent admin from demoting themselves
      }


      // Handle email change (only if current user is editing their own profile)
      if (id === currentUser.uid && email.trim().toLowerCase() !== currentUser.email?.toLowerCase()) {
        if (!current_password_for_reauth) {
          toast({ title: "Reautenticación Requerida", description: "Para cambiar tu email, ingresa tu contraseña actual.", variant: "destructive" });
          return;
        }
        try {
          const credential = EmailAuthProvider.credential(currentUser.email!, current_password_for_reauth);
          await reauthenticateWithCredential(currentUser, credential);
          await firebaseUpdateEmail(currentUser, email.trim());
          firestoreUpdateData.email = email.trim().toLowerCase(); // Update email in Firestore too
          toast({ title: "Email Actualizado", description: "Tu email ha sido actualizado. Puede que necesites volver a iniciar sesión." });
        } catch (reauthError: any) {
          console.error("Reauthentication failed:", reauthError);
          toast({ title: "Error de Reautenticación", description: "Contraseña actual incorrecta. No se pudo cambiar el email.", variant: "destructive" });
          return;
        }
      } else if (id !== currentUser.uid && originalUser && email.trim().toLowerCase() !== originalUser.email.toLowerCase() && currentUserAppRole === 'admin') {
        // Admin changing email of another user: Only update in Firestore. Auth email change requires user action or Admin SDK.
        firestoreUpdateData.email = email.trim().toLowerCase();
        toast({ title: "Email Actualizado (Datos)", description: `El email de ${username.trim()} se actualizó en la base de datos. El usuario usará este nuevo email para notificaciones, pero su email de inicio de sesión no cambiará sin su acción.`, duration: 7000 });
      }


      // Handle password change (only if current user is editing their own profile)
      if (id === currentUser.uid && new_password_plaintext && new_password_plaintext.trim()) {
        if (!isStrongPassword(new_password_plaintext.trim())) {
          toast({ title: "Contraseña Débil", description: PASSWORD_POLICY_TEXT, variant: "destructive" });
          return;
        }
        if (!current_password_for_reauth) {
          toast({ title: "Reautenticación Requerida", description: "Para cambiar tu contraseña, ingresa tu contraseña actual.", variant: "destructive" });
          return;
        }
        try {
          const credential = EmailAuthProvider.credential(currentUser.email!, current_password_for_reauth);
          await reauthenticateWithCredential(currentUser, credential);
          await firebaseUpdatePassword(currentUser, new_password_plaintext.trim());
          toast({ title: "Contraseña Actualizada", description: "Tu contraseña ha sido actualizada." });
        } catch (reauthError: any) {
          console.error("Reauthentication/Password Update failed:", reauthError);
          toast({ title: "Error al Cambiar Contraseña", description: "Contraseña actual incorrecta o error al actualizar.", variant: "destructive" });
          return;
        }
      }
      
      await updateDoc(userDocRef, firestoreUpdateData);

      toast({ title: "Usuario Actualizado", description: `La información de ${username.trim()} ha sido guardada.` });
      setIsEditUserDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({ title: "Error al Actualizar", description: error.message, variant: "destructive" });
    }
  };
  
  const handleSendPasswordReset = async (emailToReset: string) => {
    if (!emailToReset) {
        toast({ title: "Error", description: "No se proporcionó un email.", variant: "destructive"});
        return;
    }
    try {
        await sendPasswordResetEmail(auth, emailToReset);
        toast({ title: "Correo Enviado", description: `Se envió un correo para restablecer la contraseña a ${emailToReset}.` });
    } catch (error: any) {
        console.error("Error sending password reset email:", error);
        toast({ title: "Error", description: "No se pudo enviar el correo de restablecimiento.", variant: "destructive"});
    }
  };


  const handleDeleteUser = (user: AppUser) => {
    if (currentUserAppRole !== 'admin') {
        toast({ title: "Permiso Denegado", variant: "destructive"}); return;
    }
    if (user.id === currentUser?.uid) {
        toast({ title: "Acción no permitida", description: "No puedes eliminar tu propia cuenta.", variant: "destructive"}); return;
    }
    setUserToDelete(user);
    setShowDeleteUserDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || currentUserAppRole !== 'admin') return;

    try {
      // Delete user from Firestore
      await deleteDoc(doc(db, "users", userToDelete.id));
      // Note: Deleting from Firebase Auth requires Admin SDK or re-authentication of the user being deleted.
      // This client-side deletion only removes them from Firestore, effectively deactivating them in this app's context.
      // The Firebase Auth account will still exist.
      toast({ title: "Usuario Eliminado (Datos)", description: `El usuario ${userToDelete.username} ha sido eliminado de la lista de la aplicación. Su cuenta de autenticación puede persistir.` });
    } catch (error: any) {
        console.error("Error deleting user from Firestore:", error);
        toast({ title: "Error al Eliminar", description: "No se pudo eliminar el usuario de la base de datos.", variant: "destructive"});
    }
    setShowDeleteUserDialog(false);
    setUserToDelete(null);
  };

  const displayedUsers = useMemo(() => {
    if (currentUserAppRole === 'admin') return appUsers;
    if (currentUserAppRole === 'secretary' && currentUser) {
      return appUsers.filter(user => user.id === currentUser.uid);
    }
    return [];
  }, [appUsers, currentUserAppRole, currentUser]);


  if (!mounted || loading || loadingUsers) {
    return (
      <div className="space-y-8 animate-pulse">
        <CardHeader className="px-0"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-5 w-1/2 mt-2" /></CardHeader>
        {[1,2].map(i => ( // Reduced skeleton cards
            <Card key={i} className="shadow-lg">
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                <CardFooter className="flex justify-end"><Skeleton className="h-10 w-36" /></CardFooter>
            </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold tracking-tight flex items-center">
          <Settings2 className="mr-3 h-8 w-8 text-primary" />
          Configuraciones Generales
        </CardTitle>
        <CardDescription>Gestión de datos maestros y usuarios del sistema.</CardDescription>
      </CardHeader>

      {!localStorageAvailable && ( /* For uniform section */
          <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-6"><div className="flex items-center"><AlertCircle className="h-5 w-5 text-destructive mr-2" /><p className="text-sm text-destructive-foreground font-medium">Almacenamiento local de uniformes no disponible.</p></div></CardContent>
          </Card>
      )}

      {hasUniformChanges && localStorageAvailable && (
        <Card className="border-primary bg-primary/10"><CardContent className="pt-6"><div className="flex items-center"><AlertCircle className="h-5 w-5 text-primary mr-2" /><p className="text-sm text-primary font-medium">Tienes cambios sin guardar en tipos de prendas.</p></div></CardContent></Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary" />Administrar Tipos de Prenda</CardTitle>
          <CardDescription>Edita el nombre y la categoría de las prendas. (Estos datos se guardan localmente)</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-3">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10"><TableRow><TableHead className="w-1/4">ID Prenda</TableHead><TableHead>Nombre Actual</TableHead><TableHead>Nuevo Nombre</TableHead><TableHead>Categoría Actual</TableHead><TableHead>Nueva Categoría</TableHead></TableRow></TableHeader>
              <TableBody>
                {editedUniformTypes.map((uniType) => {
                  const originalType = uniformTypes.find(u => u.id === uniType.id) || uniType;
                  return ( <TableRow key={uniType.id}><TableCell className="font-mono text-xs text-muted-foreground">{uniType.id}</TableCell><TableCell className="text-muted-foreground">{originalType.name}</TableCell><TableCell><Input value={uniType.name} onChange={(e) => handleUniformInputChange(uniType.id, 'name', e.target.value)} placeholder="Nombre de la prenda" /></TableCell><TableCell className="text-muted-foreground">{originalType.category}</TableCell><TableCell><Input value={uniType.category} onChange={(e) => handleUniformInputChange(uniType.id, 'category', e.target.value)} placeholder="Categoría" /></TableCell></TableRow> );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-end"><Button onClick={handleSaveUniformChanges} disabled={!hasUniformChanges || !localStorageAvailable} className="shadow hover:shadow-md"><Save className="mr-2 h-4 w-4" />Guardar Cambios en Prendas</Button></CardFooter>
      </Card>

      {/* User Management Section */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center"><Users2 className="mr-2 h-5 w-5 text-primary" />Gestionar Usuarios</CardTitle>
            <CardDescription>Administra los usuarios con acceso al sistema.</CardDescription>
          </div>
          {currentUserAppRole === 'admin' && (
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild><Button onClick={handleOpenAddUserDialog} className="shadow hover:shadow-md"><UserPlus className="mr-2 h-4 w-4" />Agregar Usuario</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>Agregar Nuevo Usuario</DialogTitle></DialogHeader>
                <form onSubmit={handleAddNewUser} className="space-y-4">
                  <div><Label htmlFor="newUsername">Nombre de Usuario</Label><Input id="newUsername" value={addUserFormState.username} onChange={(e) => setAddUserFormState(s => ({ ...s, username: e.target.value }))} required /></div>
                  <div><Label htmlFor="newEmail">Email</Label><Input id="newEmail" type="email" value={addUserFormState.email} onChange={(e) => setAddUserFormState(s => ({ ...s, email: e.target.value }))} required /></div>
                  <div><Label htmlFor="newPassword">Contraseña</Label><Input id="newPassword" type="password" value={addUserFormState.password_plaintext} onChange={(e) => setAddUserFormState(s => ({ ...s, password_plaintext: e.target.value }))} required /><p className="text-xs text-muted-foreground mt-1">{PASSWORD_POLICY_TEXT}</p></div>
                  <div><Label htmlFor="newRole">Rol</Label><Select value={addUserFormState.role} onValueChange={(value: 'admin' | 'secretary') => setAddUserFormState(s => ({ ...s, role: value }))}><SelectTrigger id="newRole"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Administrador</SelectItem><SelectItem value="secretary">Secretaria</SelectItem></SelectContent></Select></div>
                  <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit">Agregar Usuario</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-3">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10"><TableRow><TableHead>Nombre de Usuario</TableHead><TableHead>Email</TableHead><TableHead>Rol</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {displayedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell><TableCell className="text-muted-foreground">{user.email}</TableCell><TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditUserDialog(user)} className="shadow-sm hover:shadow"><Edit3 className="mr-1.5 h-3.5 w-3.5" />Editar</Button>
                      {currentUserAppRole === 'admin' && currentUser?.uid !== user.id && ( <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user)} className="shadow-sm hover:shadow"><Trash2 className="mr-1.5 h-3.5 w-3.5" />Eliminar</Button> )}
                      {currentUserAppRole === 'admin' && currentUser?.uid !== user.id && ( <Button variant="secondary" size="sm" onClick={() => handleSendPasswordReset(user.email)} className="shadow-sm hover:shadow"><Send className="mr-1.5 h-3.5 w-3.5" />Rest. Contraseña</Button>)}
                    </TableCell>
                  </TableRow>
                ))}
                {displayedUsers.length === 0 && (<TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No hay usuarios para mostrar.</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        {/* No global "Save User Changes" button; changes are per-user via dialogs or direct Firestore writes */}
      </Card>
      
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Usuario: {editUserFormState.username}</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateEditedUser} className="space-y-4">
            <div><Label htmlFor="editUsername">Nombre de Usuario</Label><Input id="editUsername" value={editUserFormState.username} onChange={(e) => setEditUserFormState(s => ({ ...s, username: e.target.value }))} required /></div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input id="editEmail" type="email" value={editUserFormState.email} 
                     onChange={(e) => setEditUserFormState(s => ({ ...s, email: e.target.value }))} 
                     required 
                     disabled={currentUserAppRole === 'admin' && editUserFormState.id !== currentUser?.uid} // Admin cannot directly change other's login email here
              />
              {currentUserAppRole === 'admin' && editUserFormState.id !== currentUser?.uid && <p className="text-xs text-muted-foreground mt-1">Para cambiar el email de inicio de sesión, el usuario debe hacerlo o usar un proceso de verificación.</p>}
            </div>
            
            {editUserFormState.id === currentUser?.uid && (
              <>
                <div><Label htmlFor="editNewPassword">Nueva Contraseña (opcional)</Label><Input id="editNewPassword" type="password" value={editUserFormState.new_password_plaintext || ''} onChange={(e) => setEditUserFormState(s => ({ ...s, new_password_plaintext: e.target.value }))} placeholder="Dejar en blanco para no cambiar" /><p className="text-xs text-muted-foreground mt-1">{PASSWORD_POLICY_TEXT}</p></div>
                <div><Label htmlFor="currentPassword">Contraseña Actual (para cambiar email/contraseña)</Label><Input id="currentPassword" type="password" value={editUserFormState.current_password_for_reauth || ''} onChange={(e) => setEditUserFormState(s => ({ ...s, current_password_for_reauth: e.target.value }))} /></div>
              </>
            )}

            {currentUserAppRole === 'admin' && ( 
                <div><Label htmlFor="editRole">Rol</Label>
                <Select 
                    value={editUserFormState.role} 
                    onValueChange={(value: 'admin' | 'secretary') => setEditUserFormState(s => ({ ...s, role: value }))}
                    disabled={editUserFormState.id === currentUser?.uid && editUserFormState.role === 'admin'}
                >
                    <SelectTrigger id="editRole"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin" disabled={editUserFormState.id === currentUser?.uid && editUserFormState.role === 'admin'}>Administrador</SelectItem>
                        <SelectItem value="secretary">Secretaria</SelectItem>
                    </SelectContent>
                </Select>
                 {editUserFormState.id === currentUser?.uid && editUserFormState.role === 'admin' && <p className="text-xs text-muted-foreground mt-1">Los administradores no pueden cambiar su propio rol a secretaria.</p>}
                </div>
            )}
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit">Actualizar Usuario</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Estás seguro de eliminar este usuario de la aplicación?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará al usuario <span className="font-semibold">{userToDelete?.username}</span> de la base de datos de la aplicación. Su cuenta de autenticación podría persistir.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => {setShowDeleteUserDialog(false); setUserToDelete(null);}}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar Usuario</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image management section - remains placeholder */}
      <Card className="shadow-lg">
        <CardHeader><CardTitle className="text-xl flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" />Gestión de Imágenes y Logo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">Esta sección permitirá gestionar las imágenes de los productos y el logo de la aplicación.</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4 text-sm">
                <li>Administrar imágenes asociadas a cada tipo de prenda. (Próximamente)</li>
                <li>Actualizar el logo principal de la aplicación {siteConfig.name}. (Próximamente)</li>
            </ul>
            <div className="pt-2 text-center"><Button variant="outline" className="mt-4" disabled>Administrar Imágenes (Próximamente)</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
