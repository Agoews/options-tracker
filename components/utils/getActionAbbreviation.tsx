export const getActionAbbreviation = (action: string) => {
  switch (action) {
    case "COVERED CALL":
      return "CC";
    case "CASH SECURED PUT":
      return "CSP";
    case "CALL":
      return "CALL";
    case "PUT":
      return "PUT";
    default:
      return "";
  }
};
