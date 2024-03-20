export const handleSupabaseError = (error) => {
  if (error) {
    throw new Error(error.message);
  }
};
