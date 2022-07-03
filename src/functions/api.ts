import {
  MessageActionRow,
  Modal,
  TextInputComponent,
} from "discord.js";

export async function makeModal(
  title: string,
  id: string,
  data: MessageActionRow<TextInputComponent>
) {
  const modal = new Modal().setTitle(title).setCustomId(id).setComponents(data);
  return modal;
}
