const participantsMapper = (listItem) => {
  listItem.participants = listItem.participants?.split(',') ?? [];
  listItem.participantsIds = listItem.participants_ids?.split(',') ?? [];
  return listItem;
};

export default participantsMapper;
