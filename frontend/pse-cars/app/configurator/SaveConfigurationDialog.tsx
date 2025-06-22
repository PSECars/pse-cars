import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide, TextField} from "@mui/material";
import Button from "@/app/components/Button";
import React, {useEffect, useState} from "react";

export function SaveConfigurationDialog({
                                          open,
                                          setOpen,
                                          saveConfigurationCallback
                                        }: {
  open: boolean,
  setOpen: (open: boolean) => void,
  saveConfigurationCallback: (name: string) => void
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      keepMounted
      aria-describedby="save-config-dialog-description"
    >
      <DialogTitle>Save Configuration</DialogTitle>
      <DialogContent>
        <DialogContentText id="save-config-dialog-description">
          To save the current configuration, please enter a name for it.
          This will allow you to retrieve it later.
        </DialogContentText>
        <TextField
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          required
          margin="dense"
          id="name"
          name="name"
          label="Name of Configuration"
          type="text"
          fullWidth
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={() => saveConfigurationCallback(name)}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
