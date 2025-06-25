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

  function onSave() {
    if (name.length <= 1) {
      return;
    }
    saveConfigurationCallback(name);
  }

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
        <Button onClick={() => setOpen(false)} className="bg-gray-800 hover:bg-gray-900">Cancel</Button>
        <Button onClick={onSave} className="bg-green-700 hover:bg-green-800">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
