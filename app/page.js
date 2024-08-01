'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button, capitalize, Divider } from "@mui/material";
import { collection, getDocs, query, setDoc , getDoc, doc, deleteDoc} from "firebase/firestore";
require('dotenv').config();

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
      }}  sx={{color:"#121212", fontWeight: "bold", padding: "18px", borderRadius: "15px", textTransform:"none"}} >
        + Add Item
      </Button>
        
      </Box>

      < Stack border="1px solid black" width={"80vw"} height={"300px"} overflow={"auto"} boxShadow={"0px 4px 50px #0039a6"}> 
        <Stack direction={"row"} bgcolor={"blue"} padding={3} justifyContent={"space-between"} paddingLeft={5} paddingRight={12}>
          <Typography variant="h5" color={"WHITE"} textAlign={"center"}>Item</Typography>
          <Typography variant="h5" color={"WHITE"} textAlign={"center"}>Quantity</Typography>
          <Typography variant="h5" color={"WHITE"} textAlign={"center"}>Actions</Typography>
        </Stack>
        <Stack direction={"row"} bgcolor={"white"} padding={3} paddingLeft={4} justifyContent={"space-between"}>
        <Stack direction={"column"} spacing={3.5} display={"flex"}  >
        { inventory.map(({name}) => (
          
          <Typography variant="h5" color={"black"} textAlign={"center"}>{name}</Typography>
              
        ))
      }
      </Stack>  
      <Stack direction={"column"} spacing={3.5} display={"flex"} >
      { inventory.map(({quantity}) => (
          
          <Typography variant="h5" color={"black"} textAlign={"center"}>{quantity}</Typography>
              
        ))
      }
      </Stack>
      <Stack direction={"column"} spacing={3} display={"flex"}  >
        { inventory.map(({name}) => (
          <Stack direction={"row"} spacing={3} display={"flex"} justifyContent={"space-between"}>
            <Button variant="contained" onClick={() => {
            addItem(name);
          }}>Add</Button>
            
          <Button variant="contained" onClick={() => {
            removeItems(name);
          }}>Remove</Button>
            </Stack>  
        ))
      }
      
      </Stack>
      </Stack>
          
      </Stack>
      </Box>
      <Stack direction={"row"} spacing={3} display={"flex"} justifyContent={"center"} marginTop={"50px"} >
        <Box bgcolor={"grey"} width={"150px"} height={"150px"} display="flex" justifyContent="center" alignItems="center" gap={2}  borderRadius={"10px"} >
          <Stack direction={"column"} spacing={2} display={"flex"} justifyContent={"center"} alignItems={"center"}>
          <Typography variant="h7" color={"white"} textAlign={"center"}>Total Items</Typography>
          <Typography variant="h5" color={"white"}>{inventory.length}</Typography>
          </Stack>
        </Box>
        <Box bgcolor={"grey"} width={"150px"} height={"150px"} display="flex" justifyContent="center" alignItems="center" gap={2}  borderRadius={"10px"} >
          <Stack direction={"column"} spacing={2} display={"flex"} justifyContent={"center"} alignItems={"center"}>
          <Typography variant="h7" color={"white"} textAlign={"center"}>Total Quantity</Typography>
          <Typography variant="h5" color={"white"}>{inventory.reduce((acc, {quantity}) => acc + quantity, 0)}</Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
    
  );
}
