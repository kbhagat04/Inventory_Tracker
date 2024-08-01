'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button, capitalize } from "@mui/material";
import { collection, getDocs, query, setDoc , getDoc, doc, deleteDoc} from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');

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

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    }else {
      await setDoc(docRef, { quantity: 1 });
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
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, []);

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
          sx={{transform: "translate(-50%,-50%)"}}>
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField variant="outlined" fullWidth value={itemName} 
            onChange={(e) => {
              setItemName(e.target.value);
            }}>
            </TextField>
            <Button variant="outlined" onClick={()=>{
              addItem(itemName);
              setItemName('');
              handleClose();
            }}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      
      <Box >
        <Box  height="100px" display="flex" alignItems="center" justifyContent={"space-between"} padding={5}>
          <Typography variant="h4" color="white" sx={{ flexGrow: 1 }}>Inventory</Typography>
          <Button variant="contained" onClick={() => {
        handleOpen();
      }}>
        Add new item
      </Button>
        
      </Box>
      <Stack border="1px solid black" width={"80vw"} height={"400px"} overflow={"auto"} boxShadow={"0px 4px 50px #0039a6"}>
        <Stack direction={"row"} bgcolor={"blue"} padding={3}>
          <Typography variant="h5" color={"WHITE"} textAlign={"center"}>Item</Typography>
          </Stack>       
        {
          inventory.map(({name, quantity}) => (
            <Box key={name} width="100%" minHeight={"10px"} display={"flex"} alignItems={"center"} justifyContent={"space-between"} bgcolor={"white"} padding={5}>
              <Typography variant="h5" color={"black"} textAlign={"center"} textTransform={"capitalize"}>{name}</Typography>
              <Typography variant="h5" color={"black"} textAlign={"center"} textTransform={"capitalize"}>{quantity}</Typography>
              <Button variant="contained" onClick={()=>  {
                removeItems(name);
              }}>Remove</Button>
            </Box>
        ))
        }
      </Stack>
      </Box>
    </Box>
  );
}
