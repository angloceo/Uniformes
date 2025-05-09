
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { initialUniforms, type Uniform } from '@/lib/mock-data';
import { Settings2, Save, AlertCircle, Edit3, ImageIcon, Users2, UserPlus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { siteConfig } from '@/config/site';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppUser {
  id: string;
  username: string;
  password_plaintext: string; // Stored as plaintext for mock purposes ONLY. NEVER do this in production.
  role: 'admin' | 'secretary';
}

const defaultAdminUser: AppUser = {
  id: `user-${Date.now()}-admin`,
  username: 'admin',
  password_plaintext: 'admin123',
  role: 'admin'
};

const defaultSecretaryUser: AppUser = {
  id: `user-${Date.now()}-secretary`,
  username: 'secretary',
  password_plaintext: 'secretary123',
  role: 'secretary'
};

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
  const [addUserFormState, setAddUserFormState] = useState({ username: '', password_plaintext: '', role: 'secretary' as 'admin' | 'secretary' });
  const [editUserFormState, setEditUserFormState] = useState<AppUser & { originalUsername: string }>({ id: '', username: '', password_plaintext: '', role: 'secretary', originalUsername: '' });


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Load Uniforms
      const storedUniformsRaw = localStorage.getItem('updatedUniformsData');
      let liveUniformsData: Uniform[];
      if (storedUniformsRaw) {
        try {
          const parsedData = JSON.parse(storedUniformsRaw);
          if (Array.isArray(parsedData) && parsedData.every(item => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.category === 'string' && Array.isArray(item.sizes))) {
            liveUniformsData = parsedData;
          } else {
            liveUniformsData = JSON.parse(JSON.stringify(initialUniforms));
            localStorage.setItem('updatedUniformsData', JSON.stringify(liveUniformsData));
          }
        } catch (error) {
          liveUniformsData = JSON.parse(JSON.stringify(initialUniforms));
          localStorage.setItem('updatedUniformsData', JSON.stringify(liveUniformsData));
        }
      } else {
        liveUniformsData = JSON.parse(JSON.stringify(initialUniforms));
        localStorage.setItem('updatedUniformsData', JSON.stringify(liveUniformsData));
      }
      setUniformTypes(liveUniformsData);
      setEditedUniformTypes(JSON.parse(JSON.stringify(liveUniformsData)));

      // Load Users
      const storedUsersRaw = localStorage.getItem('appUsersData');
      let liveUsersData: AppUser[];
      if (storedUsersRaw) {
        try {
          liveUsersData = JSON.parse(storedUsersRaw);
          if (!Array.isArray(liveUsersData) || liveUsersData.length === 0) {
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
      toast({
        title: "Error de Validación",
        description: "El nombre y la categoría de la prenda no pueden estar vacíos.",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem('updatedUniformsData', JSON.stringify(editedUniformTypes));
    setUniformTypes(JSON.parse(JSON.stringify(editedUniformTypes)));
    toast({ title: "Cambios Guardados", description: "Los tipos de prendas han sido actualizados." });
    setHasUniformChanges(false);
  };

  // User Management Handlers
  const handleOpenAddUserDialog = () => {
    setAddUserFormState({ username: '', password_plaintext: '', role: 'secretary' });
    setIsAddUserDialogOpen(true);
  };

  const handleAddNewUser = (e: FormEvent) => {
    e.preventDefault();
    if (!addUserFormState.username.trim() || !addUserFormState.password_plaintext.trim()) {
      toast({ title: "Error", description: "Nombre de usuario y contraseña son requeridos.", variant: "destructive" });
      return;
    }
    if (editedAppUsers.some(user => user.username === addUserFormState.username.trim())) {
      toast({ title: "Error", description: "El nombre de usuario ya existe.", variant: "destructive" });
      return;
    }
    const newUser: AppUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username: addUserFormState.username.trim(),
      password_plaintext: addUserFormState.password_plaintext, // In real app, hash this server-side
      role: addUserFormState.role,
    };
    setEditedAppUsers(prev => [...prev, newUser]);
    setHasUserChanges(true);
    setIsAddUserDialogOpen(false);
    toast({ title: "Usuario Agregado", description: `Usuario ${newUser.username} listo para guardar.` });
  };
  
  const handleOpenEditUserDialog = (userToEdit: AppUser) => {
    setEditUserFormState({ ...userToEdit, password_plaintext: '', originalUsername: userToEdit.username }); // Clear password field for editing
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateEditedUser = (e: FormEvent) => {
    e.preventDefault();
    const { id, username, password_plaintext, role, originalUsername } = editUserFormState;
    if (!username.trim()) {
      toast({ title: "Error", description: "El nombre de usuario es requerido.", variant: "destructive" });
      return;
    }
    // Check for username uniqueness if it has changed
    if (username.trim() !== originalUsername && editedAppUsers.some(user => user.id !== id && user.username === username.trim())) {
      toast({ title: "Error", description: "El nombre de usuario ya existe.", variant: "destructive" });
      return;
    }

    setEditedAppUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === id) {
          return {
            ...user,
            username: username.trim(),
            // Update password only if a new one is provided
            password_plaintext: password_plaintext.trim() ? password_plaintext.trim() : user.password_plaintext,
            role,
          };
        }
        return user;
      })
    );
    setHasUserChanges(true);
    setIsEditUserDialogOpen(false);
    toast({ title: "Usuario Actualizado", description: `Usuario ${username.trim()} listo para guardar.` });
  };

  const handleSaveUserChanges = () => {
    // Further validation can be added here if needed
    localStorage.setItem('appUsersData', JSON.stringify(editedAppUsers));
    setAppUsers(JSON.parse(JSON.stringify(editedAppUsers)));
    toast({ title: "Cambios Guardados", description: "La información de los usuarios ha sido actualizada."});
    setHasUserChanges(false);
  };


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
              <p className="text-sm text-primary-dark font-medium">
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
            <CardDescription>Administra los usuarios con acceso al sistema. <span className="font-semibold text-destructive">Nota: Las contraseñas se guardan en texto plano (solo para demostración).</span></CardDescription>
          </div>
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAddUserDialog} className="shadow hover:shadow-md"><UserPlus className="mr-2 h-4 w-4" />Agregar Usuario</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Agregar Nuevo Usuario</DialogTitle></DialogHeader>
              <form onSubmit={handleAddNewUser} className="space-y-4">
                <div><Label htmlFor="newUsername">Nombre de Usuario</Label><Input id="newUsername" value={addUserFormState.username} onChange={(e) => setAddUserFormState(s => ({ ...s, username: e.target.value }))} required /></div>
                <div><Label htmlFor="newPassword">Contraseña</Label><Input id="newPassword" type="password" value={addUserFormState.password_plaintext} onChange={(e) => setAddUserFormState(s => ({ ...s, password_plaintext: e.target.value }))} required /></div>
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
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-3">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow><TableHead>Nombre de Usuario</TableHead><TableHead>Rol</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {editedAppUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditUserDialog(user)} className="shadow-sm hover:shadow"><Edit3 className="mr-1.5 h-3.5 w-3.5" />Editar</Button>
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
          <DialogHeader><DialogTitle>Editar Usuario: {editUserFormState.originalUsername}</DialogTitle><DialogDescription>Deje la contraseña en blanco para no cambiarla.</DialogDescription></DialogHeader>
          <form onSubmit={handleUpdateEditedUser} className="space-y-4">
            <div><Label htmlFor="editUsername">Nombre de Usuario</Label><Input id="editUsername" value={editUserFormState.username} onChange={(e) => setEditUserFormState(s => ({ ...s, username: e.target.value }))} required /></div>
            <div><Label htmlFor="editPassword">Nueva Contraseña (opcional)</Label><Input id="editPassword" type="password" value={editUserFormState.password_plaintext} onChange={(e) => setEditUserFormState(s => ({ ...s, password_plaintext: e.target.value }))} placeholder="Dejar en blanco para no cambiar" /></div>
            <div>
              <Label htmlFor="editRole">Rol</Label>
              <Select value={editUserFormState.role} onValueChange={(value: 'admin' | 'secretary') => setEditUserFormState(s => ({ ...s, role: value }))}>
                <SelectTrigger id="editRole"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="admin">Administrador</SelectItem><SelectItem value="secretary">Secretaria</SelectItem></SelectContent>
              </Select>
            </div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit">Actualizar Usuario</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" />Gestión de Imágenes y Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">Esta sección permitirá gestionar las imágenes de los productos y el logo de la aplicación.</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4 text-sm">
                <li>Administrar imágenes asociadas a cada tipo de prenda.</li>
                <li>Actualizar el logo principal de la aplicación {siteConfig.name}.</li>
            </ul>
            <div className="pt-2 text-center">
                <Button variant="outline" className="mt-4" disabled>Administrar Imágenes (Próximamente)</Button>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
