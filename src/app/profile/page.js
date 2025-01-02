// src/app/profile/page.js
"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Mail, User, RefreshCcw, Database, HelpCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import InstallButton from '@/components/InstallButton';
import WelcomeModal from '@/components/WelcomeModal';

const Profile = () => {
 const { user, logout } = useAuth();
 const router = useRouter();
 const [loading, setLoading] = useState(false);
 const [showWelcome, setShowWelcome] = useState(false);

 const handleLogout = async () => {
   try {
     await logout();
     router.push('/login');
   } catch (error) {
     console.error('Error logging out:', error);
   }
 };

 const resetData = async () => {
   if (!user) return;
   if (!confirm('Are you sure you want to delete all entries? This cannot be undone.')) return;
   
   setLoading(true);
   try {
     const q = query(collection(db, 'entries'), where('userId', '==', user.uid));
     const querySnapshot = await getDocs(q);
     const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
     await Promise.all(deletePromises);
     alert('All entries have been deleted');
   } catch (error) {
     console.error('Error resetting data:', error);
     alert('Error deleting entries');
   } finally {
     setLoading(false);
   }
 };

 const addExampleData = async () => {
   if (!user) return;
   setLoading(true);
   try {
     const generateEntry = (date, type, data) => ({
       userId: user.uid,
       date: date.toISOString(),
       type,
       ...data
     });
 
     const entries = [];
     
     for (let i = 13; i >= 0; i--) {
       const currentDate = new Date();
       currentDate.setDate(currentDate.getDate() - i);
       const isFirstWeek = i >= 7;
       
       currentDate.setHours(8, 0, 0, 0);
       entries.push(generateEntry(new Date(currentDate), 'food', {
         food: isFirstWeek ? 'Wheat Toast with Jam' : 'Oatmeal with Berries',
         ingredients: isFirstWeek ? 'wheat bread, butter, strawberry jam' : 'oats, blueberries, honey, almond milk',
         sensitivities: isFirstWeek ? ['gluten', 'dairy'] : [],
         mealType: 'Breakfast'
       }));
 
       currentDate.setHours(12, 30, 0, 0);
       entries.push(generateEntry(new Date(currentDate), 'food', {
         food: isFirstWeek ? 'Turkey Sandwich' : 'Quinoa Bowl',
         ingredients: isFirstWeek ? 'wheat bread, turkey, cheese, lettuce, mayo' : 'quinoa, chickpeas, avocado, olive oil, lemon',
         sensitivities: isFirstWeek ? ['gluten', 'dairy'] : ['legumes'],
         mealType: 'Lunch'
       }));
 
       currentDate.setHours(18, 30, 0, 0);
       entries.push(generateEntry(new Date(currentDate), 'food', {
         food: isFirstWeek ? 'Pasta Alfredo' : 'Grilled Salmon',
         ingredients: isFirstWeek ? 'wheat pasta, cream, parmesan, butter, garlic' : 'salmon, rice, broccoli, olive oil, garlic',
         sensitivities: isFirstWeek ? ['gluten', 'dairy'] : [],
         mealType: 'Dinner'
       }));
 
       currentDate.setHours(15, 30, 0, 0);
       entries.push(generateEntry(new Date(currentDate), 'food', {
         food: isFirstWeek ? 'Crackers and Cheese' : 'Mixed Nuts',
         ingredients: isFirstWeek ? 'wheat crackers, cheddar cheese' : 'almonds, walnuts, cashews',
         sensitivities: isFirstWeek ? ['gluten', 'dairy'] : ['nuts'],
         mealType: 'Snack'
       }));
 
       currentDate.setHours(21, 0, 0, 0);
       entries.push(generateEntry(new Date(currentDate), 'wellness', {
         stomach: isFirstWeek ? 'Poor' : 'Good',
         energy: isFirstWeek ? 'Low' : 'High'
       }));
     }
 
     const addPromises = entries.map(entry => addDoc(collection(db, 'entries'), entry));
     await Promise.all(addPromises);
     alert('Example data has been added');
   } catch (error) {
     console.error('Error adding example data:', error);
     alert('Error adding example data');
   } finally {
     setLoading(false);
   }
 };

 return (
   <div className="max-w-2xl mx-auto pb-24 px-4">
     <div className="flex justify-between items-center mb-4">
       <h1 className="text-2xl font-bold">Profile</h1>
       <button 
         onClick={() => setShowWelcome(true)} 
         className="p-2 hover:bg-gray-100 rounded-full"
       >
         <HelpCircle className="w-6 h-6 text-gray-500" />
       </button>
     </div>

     <Card className="mb-6">
       <CardHeader>
         <CardTitle>Profile</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="flex items-center gap-3 text-gray-600">
           <Mail className="w-5 h-5" />
           <span>{user?.email}</span>
         </div>
         {user?.displayName && (
           <div className="flex items-center gap-3 text-gray-600">
             <User className="w-5 h-5" />
             <span>{user.displayName}</span>
           </div>
         )}
       </CardContent>
     </Card>

     <Card className="mb-6">
       <CardContent className="pt-6 space-y-4">
         <Button 
           variant="outline"
           className="w-full"
           onClick={resetData}
           disabled={loading}
         >
           <RefreshCcw className="w-4 h-4 mr-2" />
           Reset Data
         </Button>

         <Button 
           variant="outline"
           className="w-full"
           onClick={addExampleData}
           disabled={loading}
         >
           <Database className="w-4 h-4 mr-2" />
           Add Example Data
         </Button>

         <InstallButton />

         <Button 
           variant="destructive"
           className="w-full"
           onClick={handleLogout}
         >
           <LogOut className="w-4 h-4 mr-2" />
           Sign Out
         </Button>
       </CardContent>
     </Card>

     {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
   </div>
 );
};

export default Profile;