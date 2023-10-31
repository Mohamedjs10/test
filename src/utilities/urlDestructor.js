export const urlSegment = (segment) => {
  const pathname = window.location.pathname.split("/");
  pathname.shift();
  return pathname[segment];
};

export const urlParam = (param) => {
  let params = new URL(document.location).searchParams;
  return params.get(param).trim();
};
