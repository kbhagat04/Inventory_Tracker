'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button, capitalize, Divider } from "@mui/material";
import { collection, getDocs, query, setDoc , getDoc, doc, deleteDoc} from "firebase/firestore";
import "./globals.css"

require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);


const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [openRecipeModal, setOpenRecipeModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [recipe, setRecipe] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList);
  }

  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: Number(existingQuantity) + Number(quantity) });
    }else {
      await setDoc(docRef, { quantity: Number(quantity) });
    }
    await updateInventory()
  }

  const removeItems = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()) {
      const { quantity } = docSnap.data();
      if(quantity === 1) {
        await deleteDoc(docRef);
      }else{
        await setDoc(docRef, { quantity: Number(quantity) - 1 });
      }
    }
    await updateInventory()
  }

  async function generateRecipe() {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const prompt = "Generate a recipe using the following ingredients: " + inventory.map(({name}) => name).join(", ") + ". Don't add any formatting, just simply a new line for every step.";
  
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    setRecipe(text);
  }


  const buttonClick = () =>  {
    handleRecipeModalOpen();
    generateRecipe();
    
  }

  useEffect(() => {
    updateInventory()
  }, []);

  const handleRecipeModalOpen = () => setOpenRecipeModal(true);
  const handleRecipeModalClose = () => setOpenRecipeModal(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box width="100vw"
      height="100vh" 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center"
      gap={2}
      bgcolor="#121212"
    >
      <Box width="100%" position="fixed" top={0} bgcolor="#0066b2" padding={"20px"}>
        <Stack width="10000" height="10000" direction={"row"} alignItems={"right"} bgcolor={"#0066b2"} justifyContent={"space-between"}>
          <Typography variant="h5" color="white" fontFamily={"Poppins"} fontWeight={"bold"} paddingLeft={"10px"}>Smart Pantry</Typography>
        <Button variant="contained" onClick={buttonClick} sx={{ fontFamily: "Poppins" , bgcolor:"white", color:"#121212", fontWeight:"bold"}}>Generate Recipe</Button>
        </Stack>
      </Box>
      <Modal open={openRecipeModal} onClose={handleRecipeModalClose}>
        <Stack alignItems="center" overflow={"auto"} sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 , borderRadius:"10px"}}>
          <Typography variant="h6" fontFamily="Poppins" textAlign={"center"}>
            Generated Recipe:
          </Typography>
          <Typography sx={{ mt: 2  ,fontFamily: "Poppins", textAlign: "center"}}>
            {recipe}
          </Typography>
          <Button variant="contained" onClick={handleRecipeModalClose} sx={{ mt: 2, fontFamily: "Poppins", alignSelf:"center",justifyContent:"center", borderRadius:"10"}}>Close</Button>
        </Stack>
      </Modal>

      <Modal open={open} onClose={handleClose}>
        <Box 
          position="absolute" 
          top="50%" 
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid black"
          boxShadow="24"
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{transform: "translate(-50%,-50%)"}}
          >
          <Typography textAlign={"center"} variant="h6" fontFamily={"Poppins"}>Add Item</Typography>
          <Stack width="100%" spacing={2} justifyContent={"center"} textAlign={"center"}>
            <TextField variant="outlined" fullWidth value={itemName} 
            onChange={(e) => {
              setItemName(e.target.value);
            }}>
            </TextField>
            <TextField 
              variant="outlined" 
              fullWidth 
              label="Quantity"
              type="number"
              value={itemQuantity} 
              onChange={(e) => setItemQuantity(e.target.value)}
            />
            <Button variant="contained" onClick={()=>{
              addItem(itemName, itemQuantity);
              setItemName('');
              setItemQuantity(1);
              handleClose();
            }} sx={{width: "80px", alignSelf: "center", borderRadius: "10px", fontFamily: "Poppins"}}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      
      <Box paddingTop={"20px"}>
        <Box  height="100px" display="flex" alignItems="center" justifyContent={"space-between"} padding={5}>
          <Typography variant="h4" color="white" fontFamily={"Poppins"} fontWeight={"bold"} sx={{ flexGrow: 1 }}>Inventory</Typography>
          <Button variant="contained" onClick={() => {
        handleOpen();
      }}  sx={{color:"#121212", fontWeight: "bold", padding: "18px", borderRadius: "15px", textTransform:"none", fontFamily: "Poppins"}} >
        + Add Item
      </Button>
        
      </Box>

      < Stack width={"80vw"} height={"400px"} overflow={"auto"} borderRadius={"10px"}> 
        <Stack direction={"row"} bgcolor={"#0066b2"} padding={2} justifyContent={"space-between"} paddingLeft={5} paddingRight={10}>
          <Typography variant="h5" color={"WHITE"} textAlign={"center"} fontFamily={"Poppins"}>Item</Typography>
          <Typography variant="h5" color={"WHITE"} textAlign={"center"} fontFamily={"Poppins"}>Quantity</Typography>
          <Typography variant="h5" color={"WHITE"} textAlign={"center"} fontFamily={"Poppins"}>Actions</Typography>
        </Stack>
        <Stack direction={"row"} bgcolor={"white"} padding={3} paddingLeft={4} justifyContent={"space-between"}>
        <Stack direction={"column"} spacing={3.5} display={"flex"}  >
        { inventory.map(({name}) => (
          
          <Typography variant="h5" color={"black"} textAlign={"center"} fontFamily={"Poppins"}>{name}</Typography>
              
        ))
      }
      </Stack>  
      <Stack direction={"column"} spacing={3.5} display={"flex"} >
      { inventory.map(({quantity}) => (
          
          <Typography variant="h5" color={"black"} textAlign={"center"} fontFamily={"Poppins"}>{quantity}</Typography>
              
        ))
      }
      </Stack>
      <Stack direction={"column"} spacing={3} display={"flex"}  >
        { inventory.map(({name}) => (
          <Stack direction={"row"} spacing={3} display={"flex"} justifyContent={"space-between"}>
            <Button variant="contained" onClick={() => {
            addItem(name, 1);
          }} sx={{fontFamily: "Poppins"}}>Add</Button>
            
          <Button variant="contained" onClick={() => {
            removeItems(name);
          }} sx={{fontFamily: "Poppins"}}>Remove</Button>
            </Stack>  
        ))
      }
      
      </Stack>
      </Stack>
          
      </Stack>
      </Box>
      <Stack direction={"row"} spacing={3} display={"flex"} justifyContent={"center"} marginTop={"40px"} >
        <Box bgcolor={"#0066b2"} width={"150px"} height={"150px"} display="flex" justifyContent="center" alignItems="center" gap={2}  borderRadius={"10px"} >
          <Stack direction={"column"} spacing={2} display={"flex"} justifyContent={"center"} alignItems={"center"}>
          <Typography variant="h7" color={"white"} textAlign={"center"} fontFamily={"Poppins"}>Total Items</Typography>
          <Typography variant="h4" color={"white"} fontFamily={"Poppins"}>{inventory.length}</Typography>
          </Stack>
        </Box>
        <Box bgcolor={"#0066b2"} width={"150px"} height={"150px"} display="flex" justifyContent="center" alignItems="center" gap={2}  borderRadius={"10px"} >
          <Stack direction={"column"} spacing={2} display={"flex"} justifyContent={"center"} alignItems={"center"}>
          <Typography variant="h7" color={"white"} textAlign={"center"} fontFamily={"Poppins"}>Total Quantity</Typography>
          <Typography variant="h4" color={"white"} fontFamily={"Poppins"}>{inventory.reduce((acc, item) => acc + (item.quantity || 0), 0)}</Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
    
  );
}
