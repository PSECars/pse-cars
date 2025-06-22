import {Dialog, DialogTitle, List, ListItem, ListItemButton, ListItemText} from "@mui/material";
import {SavedCar} from "@/app/http-client/openapi";
import Button from "@/app/components/Button";

export function LoadConfigurationDialog({
                                          savedCars,
                                          open,
                                          setOpen,
                                          loadConfigurationCallback,
                                          deleteConfigurationCallback,
                                        }: {
  savedCars: SavedCar[],
  open: boolean,
  setOpen: (open: boolean) => void,
  loadConfigurationCallback: (savedCar: SavedCar) => void,
  deleteConfigurationCallback: (savedCar: SavedCar) => void,
}) {
  return (
    <Dialog onClose={() => setOpen(false)} open={open}>
      <DialogTitle>Load Configuration</DialogTitle>
      <List sx={{pt: 0}}>
        {savedCars.map((savedCar) => (
          <ListItem disablePadding key={savedCar.id}>
            <ListItemButton onClick={() => loadConfigurationCallback(savedCar)}>
              {/*<ListItemAvatar>*/}
              {/*  <Avatar>*/}
              {/*    Test*/}
              {/*  </Avatar>*/}
              {/*</ListItemAvatar>*/}
              <ListItemText primary={savedCar.name}/>
            </ListItemButton>
            <Button className="bg-red-600 m-2" size="small" onClick={() => deleteConfigurationCallback(savedCar)}>X</Button>
          </ListItem>
        ))}
      </List>
    </Dialog>
  )
}
