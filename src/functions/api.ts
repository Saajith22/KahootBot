import {
  MessageActionRow,
  Modal,
  TextInputComponent,
} from "discord.js";

export async function makeModal(
  title: string,
  id: string,
  data: MessageActionRow<TextInputComponent>[]
) {
  const modal = new Modal().setTitle(title).setCustomId(id);
  data.forEach(d => modal.addComponents(d));
  
  return modal;
}
