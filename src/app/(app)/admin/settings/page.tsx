
"use client";

import { useState, useEffect, type FormEvent, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { initialUniforms, type Uniform } from '@/lib/mock-data';
import { Settings2, Save, AlertCircle, Edit3, ImageIcon, Users2, UserPlus, Trash2, Mail } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { siteConfig } from '@/config/site';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


// IMPORTANT: This is a MOCK HASH for demonstration purposes ONLY.
// In a real application, use a strong, secure, server-side hashing algorithm.
const MOCK_HASH_PREFIX = "mock_hashed::";
const createMockHash = (password: string): string => `${MOCK_HASH_PREFIX}${password}`;
// Verification is done on the login page.

interface AppUser {
  id: string;
  username: string;
  email: string;
  hashed_password: string;
  role: 'admin' | 'secretary';
}

const defaultAdminUser: AppUser = {
  id: `user-default-admin`,
  username: 'admin',
  email: 'admin@colegioanglo.edu.co',
  hashed_password: createMockHash('Admin@123!'), // Example of a stronger password
  role: 'admin'
};

const defaultSecretaryUser: AppUser = {
  id: `user-default-secretary`,
  username: 'secretary',
  email: 'secretary@colegioanglo.edu.co',
  hashed_password: createMockHash('Secretary@123!'), // Example of a stronger password
  role: 'secretary'
};

const PASSWORD_POLICY_TEXT = "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y un símbolo (ej: !@#$%).";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [uniformTypes, setUniformTypes] = useState<Uniform[]>([]);
  const [editedUniformTypes, setEditedUniformTypes] = useState<Uniform[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hasUniformChanges, setHasUniformChanges] = useState(false);

  // User management state
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [editedAppUsers, setEditedAppUsers] = useState<AppUser[]>([]);
  const [hasUserChanges, setHasUserChanges] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [addUserFormState, setAddUserFormState] = useState({ username: '', email: '', password_plaintext: '', role: 'secretary' as 'admin' | 'secretary' });
  const [editUserFormState, setEditUserFormState] = useState<AppUser & { originalUsername: string, originalEmail: string, new_password_plaintext?: string }>({ id: '', username: '', email: '', hashed_password: '', role: 'secretary', originalUsername: '', originalEmail: '', new_password_plaintext: '' });
  
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'secretary' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const role = localStorage.getItem('userRole') as 'admin' | 'secretary' | null;
      const userId = localStorage.getItem('loggedInUserId');
      setCurrentUserRole(role);
      setCurrentUserId(userId);

      // Load Uniforms
      const storedUniformsRaw = localStorage.getItem('updatedUniformsData');
      let liveUniformsData: Uniform[];
      if (storedUniformsRaw) {
        try {
          liveUniformsData = JSON.parse(storedUniformsRaw);
        } catch (error) {
          liveUniformsData = JSON.parse(JSON.stringify(initialUniforms));
        }
      } else {
        liveUniformsData = JSON.parse(JSON.stringify(initialUniforms));
      }
      setUniformTypes(liveUniformsData);
      setEditedUniformTypes(JSON.parse(JSON.stringify(liveUniformsData)));

      // Load Users
      const storedUsersRaw = localStorage.getItem('appUsersData');
      let liveUsersData: AppUser[];
      if (storedUsersRaw) {
        try {
          const parsedUsers = JSON.parse(storedUsersRaw) as AppUser[];
           if (Array.isArray(parsedUsers) && parsedUsers.length > 0 && parsedUsers.every(u => u.username && u.email && u.hashed_password && u.role)) {
            liveUsersData = parsedUsers;
          } else {
            liveUsersData = [defaultAdminUser, defaultSecretaryUser];
            localStorage.setItem('appUsersData', JSON.stringify(liveUsersData));
          }
        } catch (error) {
          liveUsersData = [defaultAdminUser, defaultSecretaryUser];
          localStorage.setItem('appUsersData', JSON.stringify(liveUsersData));
        }
      } else {
        liveUsersData = [defaultAdminUser, defaultSecretaryUser];
        localStorage.setItem('appUsersData', JSON.stringify(liveUsersData));
      }
      setAppUsers(liveUsersData);
      setEditedAppUsers(JSON.parse(JSON.stringify(liveUsersData)));

      setLoading(false);
    }
  }, [mounted]);

  const handleUniformInputChange = (id: string, field: 'name' | 'category', value: string) => {
    setEditedUniformTypes(currentTypes =>
      currentTypes.map(uniType =>
        uniType.id === id ? { ...uniType, [field]: value } : uniType
      )
    );
    setHasUniformChanges(true);
  };

  const handleSaveUniformChanges = () => {
    if (!editedUniformTypes.every(uni => uni.name.trim() !== "" && uni.category.trim() !== "")) {
      toast({ title: "Error de Validación", description: "El nombre y la categoría de la prenda no pueden estar vacíos.", variant: "destructive" });
      return;
    }
    localStorage.setItem('updatedUniformsData', JSON.stringify(editedUniformTypes));
    setUniformTypes(JSON.parse(JSON.stringify(editedUniformTypes)));
    toast({ title: "Cambios Guardados", description: "Los tipos de prendas han sido actualizados." });
    setHasUniformChanges(false);
  };

  // User Management Handlers
  const handleOpenAddUserDialog = () => {
    if (currentUserRole !== 'admin') return;
    setAddUserFormState({ username: '', email: '', password_plaintext: '', role: 'secretary' });
    setIsAddUserDialogOpen(true);
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAddNewUser = (e: FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== 'admin') return;
    
    const { username, email, password_plaintext, role } = addUserFormState;

    if (!username.trim() || !password_plaintext.trim() || !email.trim()) {
      toast({ title: "Error", description: "Nombre de usuario, email y contraseña son requeridos.", variant: "destructive" });
      return;
    }
    if (!isValidEmail(email.trim())) {
      toast({ title: "Error", description: "El formato del email es inválido.", variant: "destructive" });
      return;
    }
    if (editedAppUsers.some(user => user.username.toLowerCase() === username.trim().toLowerCase())) {
      toast({ title: "Error", description: "El nombre de usuario ya existe.", variant: "destructive" });
      return;
    }
    if (editedAppUsers.some(user => user.email.toLowerCase() === email.trim().toLowerCase())) {
      toast({ title: "Error", description: "El email ya está registrado.", variant: "destructive" });
      return;
    }

    // Basic password policy check (can be enhanced)
    if (password_plaintext.length < 8) {
        toast({ title: "Contraseña Débil", description: "La contraseña debe tener al menos 8 caracteres.", variant: "destructive"});
        return;
    }


    const newUser: AppUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username: username.trim(),
      email: email.trim(),
      hashed_password: createMockHash(password_plaintext),
      role: role,
    };
    setEditedAppUsers(prev => [...prev, newUser]);
    setHasUserChanges(true);
    setIsAddUserDialogOpen(false);
    toast({ title: "Usuario Agregado", description: `Usuario ${newUser.username} listo para guardar.` });
  };
  
  const handleOpenEditUserDialog = (userToEdit: AppUser) => {
    if (currentUserRole === 'admin' || (currentUserRole === 'secretary' && userToEdit.id === currentUserId)) {
        setEditUserFormState({ ...userToEdit, originalUsername: userToEdit.username, originalEmail: userToEdit.email, new_password_plaintext: '' });
        setIsEditUserDialogOpen(true);
    } else {
        toast({title: "Acceso Denegado", description: "No tienes permiso para editar este usuario.", variant: "destructive"})
    }
  };

  const handleUpdateEditedUser = (e: FormEvent) => {
    e.preventDefault();
    const { id, username, email, new_password_plaintext, role, originalUsername, originalEmail } = editUserFormState;

    if (!username.trim() || !email.trim()) {
      toast({ title: "Error", description: "Nombre de usuario y email son requeridos.", variant: "destructive" });
      return;
    }
     if (!isValidEmail(email.trim())) {
      toast({ title: "Error", description: "El formato del email es inválido.", variant: "destructive" });
      return;
    }
    
    if (currentUserRole !== 'admin' && id !== currentUserId) {
        toast({ title: "Error de Permiso", description: "No puedes editar este usuario.", variant: "destructive"});
        return;
    }

    if (username.trim().toLowerCase() !== originalUsername.toLowerCase() && editedAppUsers.some(user => user.id !== id && user.username.toLowerCase() === username.trim().toLowerCase())) {
      toast({ title: "Error", description: "El nombre de usuario ya existe.", variant: "destructive" });
      return;
    }
    if (email.trim().toLowerCase() !== originalEmail.toLowerCase() && editedAppUsers.some(user => user.id !== id && user.email.toLowerCase() === email.trim().toLowerCase())) {
      toast({ title: "Error", description: "El email ya está registrado por otro usuario.", variant: "destructive" });
      return;
    }
    
    if (new_password_plaintext && new_password_plaintext.trim().length > 0 && new_password_plaintext.trim().length < 8) {
        toast({ title: "Contraseña Débil", description: "La nueva contraseña debe tener al menos 8 caracteres.", variant: "destructive"});
        return;
    }


    setEditedAppUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === id) {
          const updatedUser = { ...user, username: username.trim(), email: email.trim() };
          if (new_password_plaintext && new_password_plaintext.trim()) {
            updatedUser.hashed_password = createMockHash(new_password_plaintext.trim());
          }
          if (currentUserRole === 'admin') {
            updatedUser.role = role;
          }
          return updatedUser;
        }
        return user;
      })
    );
    setHasUserChanges(true);
    setIsEditUserDialogOpen(false);
    toast({ title: "Usuario Actualizado", description: `Usuario ${username.trim()} listo para guardar.` });
  };

  const handleSaveUserChanges = () => {
    localStorage.setItem('appUsersData', JSON.stringify(editedAppUsers));
    setAppUsers(JSON.parse(JSON.stringify(editedAppUsers)));
    toast({ title: "Cambios Guardados", description: "La información de los usuarios ha sido actualizada."});
    setHasUserChanges(false);
  };

  const handleDeleteUser = (user: AppUser) => {
    if (currentUserRole !== 'admin') {
        toast({ title: "Permiso Denegado", description: "Solo los administradores pueden eliminar usuarios.", variant: "destructive"});
        return;
    }
    if (user.id === currentUserId) {
        toast({ title: "Acción no permitida", description: "No puedes eliminar tu propia cuenta de administrador.", variant: "destructive"});
        return;
    }
    setUserToDelete(user);
    setShowDeleteUserDialog(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete || currentUserRole !== 'admin') return;

    setEditedAppUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    setHasUserChanges(true);
    setShowDeleteUserDialog(false);
    toast({ title: "Usuario Eliminado", description: `El usuario ${userToDelete.username} ha sido marcado para eliminación. Guarda los cambios para confirmar.` });
    setUserToDelete(null);
  };

  const displayedUsers = useMemo(() => {
    if (currentUserRole === 'admin') {
      return editedAppUsers;
    }
    if (currentUserRole === 'secretary') {
      return editedAppUsers.filter(user => user.id === currentUserId);
    }
    return [];
  }, [editedAppUsers, currentUserRole, currentUserId]);


  if (!mounted || loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <CardHeader className="px-0"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-5 w-1/2 mt-2" /></CardHeader>
        {[1,2,3].map(i => (
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

      {(hasUniformChanges || hasUserChanges) && (
        <Card className="border-primary bg-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-primary mr-2" />
              <p className="text-sm text-primary font-medium">
                Tienes cambios sin guardar. Haz clic en el botón "Guardar Cambios" correspondiente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary" />Administrar Tipos de Prenda</CardTitle>
          <CardDescription>Edita el nombre y la categoría de las prendas.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-3">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow><TableHead className="w-1/4">ID Prenda</TableHead><TableHead>Nombre Actual</TableHead><TableHead>Nuevo Nombre</TableHead><TableHead>Categoría Actual</TableHead><TableHead>Nueva Categoría</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {editedUniformTypes.map((uniType) => {
                  const originalType = uniformTypes.find(u => u.id === uniType.id) || uniType;
                  return (
                    <TableRow key={uniType.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{uniType.id}</TableCell>
                      <TableCell className="text-muted-foreground">{originalType.name}</TableCell>
                      <TableCell><Input value={uniType.name} onChange={(e) => handleUniformInputChange(uniType.id, 'name', e.target.value)} placeholder="Nombre de la prenda" /></TableCell>
                      <TableCell className="text-muted-foreground">{originalType.category}</TableCell>
                      <TableCell><Input value={uniType.category} onChange={(e) => handleUniformInputChange(uniType.id, 'category', e.target.value)} placeholder="Categoría" /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveUniformChanges} disabled={!hasUniformChanges} className="shadow hover:shadow-md"><Save className="mr-2 h-4 w-4" />Guardar Cambios en Prendas</Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center"><Users2 className="mr-2 h-5 w-5 text-primary" />Gestionar Usuarios</CardTitle>
            <CardDescription>Administra los usuarios con acceso al sistema. <span className="font-semibold text-destructive">Nota: Las contraseñas se guardan simulando un hash (solo para demostración).</span></CardDescription>
          </div>
          {currentUserRole === 'admin' && (
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenAddUserDialog} className="shadow hover:shadow-md"><UserPlus className="mr-2 h-4 w-4" />Agregar Usuario</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Agregar Nuevo Usuario</DialogTitle></DialogHeader>
                <form onSubmit={handleAddNewUser} className="space-y-4">
                  <div><Label htmlFor="newUsername">Nombre de Usuario</Label><Input id="newUsername" value={addUserFormState.username} onChange={(e) => setAddUserFormState(s => ({ ...s, username: e.target.value }))} required /></div>
                  <div><Label htmlFor="newEmail">Email</Label><Input id="newEmail" type="email" value={addUserFormState.email} onChange={(e) => setAddUserFormState(s => ({ ...s, email: e.target.value }))} required /></div>
                  <div><Label htmlFor="newPassword">Contraseña</Label><Input id="newPassword" type="password" value={addUserFormState.password_plaintext} onChange={(e) => setAddUserFormState(s => ({ ...s, password_plaintext: e.target.value }))} required />
                  <p className="text-xs text-muted-foreground mt-1">{PASSWORD_POLICY_TEXT}</p>
                  </div>
                  <div>
                    <Label htmlFor="newRole">Rol</Label>
                    <Select value={addUserFormState.role} onValueChange={(value: 'admin' | 'secretary') => setAddUserFormState(s => ({ ...s, role: value }))}>
                      <SelectTrigger id="newRole"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="admin">Administrador</SelectItem><SelectItem value="secretary">Secretaria</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit">Agregar Usuario</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-3">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow><TableHead>Nombre de Usuario</TableHead><TableHead>Email</TableHead><TableHead>Rol</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {displayedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditUserDialog(user)} className="shadow-sm hover:shadow"><Edit3 className="mr-1.5 h-3.5 w-3.5" />Editar</Button>
                      {currentUserRole === 'admin' && user.id !== currentUserId && ( 
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user)} className="shadow-sm hover:shadow">
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />Eliminar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveUserChanges} disabled={!hasUserChanges} className="shadow hover:shadow-md"><Save className="mr-2 h-4 w-4" />Guardar Cambios en Usuarios</Button>
        </CardFooter>
      </Card>
      
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario: {editUserFormState.originalUsername}</DialogTitle>
            <DialogDescription>Deje la contraseña en blanco para no cambiarla.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateEditedUser} className="space-y-4">
            <div><Label htmlFor="editUsername">Nombre de Usuario</Label><Input id="editUsername" value={editUserFormState.username} onChange={(e) => setEditUserFormState(s => ({ ...s, username: e.target.value }))} required /></div>
            <div><Label htmlFor="editEmail">Email</Label><Input id="editEmail" type="email" value={editUserFormState.email} onChange={(e) => setEditUserFormState(s => ({ ...s, email: e.target.value }))} required /></div>
            <div>
              <Label htmlFor="editPassword">Nueva Contraseña (opcional)</Label>
              <Input id="editPassword" type="password" value={editUserFormState.new_password_plaintext} onChange={(e) => setEditUserFormState(s => ({ ...s, new_password_plaintext: e.target.value }))} placeholder="Dejar en blanco para no cambiar" />
              <p className="text-xs text-muted-foreground mt-1">{PASSWORD_POLICY_TEXT}</p>
            </div>
            {currentUserRole === 'admin' && ( 
                <div>
                <Label htmlFor="editRole">Rol</Label>
                <Select 
                    value={editUserFormState.role} 
                    onValueChange={(value: 'admin' | 'secretary') => setEditUserFormState(s => ({ ...s, role: value }))}
                    disabled={editUserFormState.id === currentUserId && editUserFormState.role === 'admin'} 
                >
                    <SelectTrigger id="editRole"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin" disabled={editUserFormState.id === currentUserId && editUserFormState.role === 'admin'}>Administrador</SelectItem>
                        <SelectItem value="secretary">Secretaria</SelectItem>
                    </SelectContent>
                </Select>
                 {editUserFormState.id === currentUserId && editUserFormState.role === 'admin' && <p className="text-xs text-muted-foreground mt-1">Los administradores no pueden cambiar su propio rol.</p>}
                </div>
            )}
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit">Actualizar Usuario</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al usuario <span className="font-semibold">{userToDelete?.username}</span>.
              Esta acción no se puede deshacer una vez guardados los cambios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {setShowDeleteUserDialog(false); setUserToDelete(null);}}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar Usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" />Gestión de Imágenes y Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">Esta sección permitirá gestionar las imágenes de los productos y el logo de la aplicación.</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4 text-sm">
                <li>Administrar imágenes asociadas a cada tipo de prenda. (Próximamente)</li>
                <li>Actualizar el logo principal de la aplicación {siteConfig.name}. (Próximamente)</li>
            </ul>
            <div className="pt-2 text-center">
                <Button variant="outline" className="mt-4" disabled>Administrar Imágenes (Próximamente)</Button>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}

