/**
 * Преобразователь элементов списка, разделяющий строки с перечислением идентификаторов
 * и имён пользователей -- участников кооперации или заблонировавшего пользователя на массивы
 * @function participantsMapper
 * @param {{ participants?: string; participants_ids?: string } & Record<string, unknown>} listItem Элемент списка с участниками в виде строк
 * @returns {{ participants: string[]; participantsIds: number[] } & Record<string, unknown>} Элемент списка с участниками в виде массивов
 */
const participantsMapper = (listItem) => {
  listItem.participants = listItem.participants?.split(',') ?? [];
  listItem.participantsIds = (listItem.participants_ids?.split(',') ?? []).map(
    (id) => parseInt(id),
  );
  return listItem;
};

export default participantsMapper;
