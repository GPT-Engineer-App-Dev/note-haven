import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, MessageSquare, LogOut } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Index = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedNotes = localStorage.getItem('notes');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleLogin = () => {
    if (username === 'user' && password === 'pass') {
      setIsLoggedIn(true);
      setIsLoginDialogOpen(false);
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsLoginDialogOpen(true);
  };

  const handleAddNote = () => {
    const newNote = {
      id: Date.now(),
      title: '',
      content: '',
      color: '#ffffff',
      tags: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setNotes([...notes, newNote]);
    setSelectedNote(newNote);
    setIsDialogOpen(true);
  };

  const handleUpdateNote = (updatedNote) => {
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(updatedNotes);
    setSelectedNote(null);
    setIsDialogOpen(false);
  };

  const handleDeleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleAddTag = (noteId, tag) => {
    const updatedNotes = notes.map(note => {
      if (note.id === noteId && !note.tags.includes(tag)) {
        return { ...note, tags: [...note.tags, tag] };
      }
      return note;
    });
    setNotes(updatedNotes);
  };

  const handleAddComment = (noteId, comment) => {
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        return { ...note, comments: [...note.comments, comment] };
      }
      return note;
    });
    setNotes(updatedNotes);
  };

  const getNotesPerDay = () => {
    const notesPerDay = {};
    notes.forEach(note => {
      const date = new Date(note.createdAt).toLocaleDateString();
      notesPerDay[date] = (notesPerDay[date] || 0) + 1;
    });
    return Object.entries(notesPerDay).map(([date, count]) => ({ date, count }));
  };

  if (!isLoggedIn) {
    return (
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <DialogFooter>
            <Button onClick={handleLogin}>Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notes App</h1>
        <Button onClick={handleLogout}><LogOut className="mr-2" /> Logout</Button>
      </div>
      <Button onClick={handleAddNote} className="mb-4"><Plus className="mr-2" /> Add Note</Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => (
          <Card key={note.id} style={{ backgroundColor: note.color }}>
            <CardHeader>
              <h2 className="text-xl font-semibold">{note.title}</h2>
            </CardHeader>
            <CardContent>
              <p>{note.content.substring(0, 100)}...</p>
              <div className="mt-2">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="mr-1">{tag}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => { setSelectedNote(note); setIsDialogOpen(true); }}>
                <Edit className="mr-2" /> Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteNote(note.id)}>
                <Trash2 className="mr-2" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNote?.id ? 'Edit Note' : 'Add Note'}</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <>
              <Input
                placeholder="Title"
                value={selectedNote.title}
                onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
              />
              <Textarea
                placeholder="Content"
                value={selectedNote.content}
                onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
              />
              <Input
                type="color"
                value={selectedNote.color}
                onChange={(e) => setSelectedNote({ ...selectedNote, color: e.target.value })}
              />
              <div className="flex items-center">
                <Input
                  placeholder="Add tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag(selectedNote.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <Tag className="ml-2" />
              </div>
              <div>
                {selectedNote.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="mr-1">{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center">
                <Input
                  placeholder="Add comment"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment(selectedNote.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <MessageSquare className="ml-2" />
              </div>
              <div>
                {selectedNote.comments.map((comment, index) => (
                  <p key={index} className="text-sm text-gray-600">{comment}</p>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={() => handleUpdateNote(selectedNote)}>Save</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Card className="mt-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Notes Created Per Day</h2>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getNotesPerDay()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;