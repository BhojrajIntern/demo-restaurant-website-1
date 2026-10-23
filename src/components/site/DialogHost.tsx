"use client";
import { CheckoutDialog } from "./CheckoutDialog";
import { DishDialog } from "./DishDialog";
import { Modal } from "./Modal";
import { useUI } from "./store";
import { TrackingDialog } from "./TrackingDialog";

/** Renders whichever dialog is open (only one at a time). */
export function DialogHost() {
  const { dialog, closeDialog } = useUI();
  if (!dialog) return null;
  const label =
    dialog.kind === "dish" ? "Dish details" : dialog.kind === "checkout" ? "Checkout" : dialog.kind === "track" ? "Order status" : dialog.label;
  return (
    <Modal open onClose={closeDialog} label={label} wide={dialog.kind === "custom" && dialog.wide}>
      {dialog.kind === "dish" && <DishDialog key={dialog.id} id={dialog.id} />}
      {dialog.kind === "checkout" && <CheckoutDialog />}
      {dialog.kind === "track" && <TrackingDialog key={dialog.id} {...dialog} />}
      {dialog.kind === "custom" && dialog.render()}
    </Modal>
  );
}
