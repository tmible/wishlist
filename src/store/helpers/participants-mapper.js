const participantsMapper = (listItem) => {
  listItem.participants = listItem.participants?.split(',') ?? [];
  return listItem;
};

export default participantsMapper;
