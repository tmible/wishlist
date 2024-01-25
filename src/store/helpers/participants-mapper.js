/**
 * Преобразователь элементов списка, разделяющий строки с перечислением идентификаторов
 * и имён пользователей -- участников кооперации или заблонировавшего пользователя на массивы
 * @function participantsMapper
 * @param {{ participants?: string; participants_ids?: string } & Record<string, unknown>} listItem элемент списка с участниками в виде строк
 * @returns {{ participants: string[]; participantsIds: string[] } & Record<string, unknown>} элемент списка с участниками в виде массивов
 */
const participantsMapper = (listItem) => {
  listItem.participants = listItem.participants?.split(',') ?? [];
  listItem.participantsIds = listItem.participants_ids?.split(',') ?? [];
  return listItem;
};

export default participantsMapper;
