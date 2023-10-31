let sqInList = [
  "SELECT",
  "DELETE",
  "UPDATE",
  "ALTER",
  "TRUNCATE",
  "OR",
  "&",
  "*",
  "=",
  "LIKE",
  "1=1",
  "AND id IS NULL",
  "UNION",
  "AND",
  "ORDER BY",
  "GROUP BY",
  "FROM",
  "SQL",
  "SCRIPT",
];

const checkDataType = (data) => {
  let check = [];
  if (Array.isArray(data)) {
    let ch = sqInList.some((substring) =>
      data?.toString()?.toLowerCase().includes(substring.toLowerCase())
    );
    if (ch) {
      check.push(1);
    }
  } else if (typeof data === "string" || data instanceof String) {
    let ch = sqInList.some((substring) =>
      data?.toString()?.toLowerCase().includes(substring.toLowerCase())
    );
    if (ch) {
      check.push(1);
    }
  } else if (typeof data === "number" || data instanceof Number) {
    let ch = sqInList.some((substring) =>
      data?.toString()?.toLowerCase().includes(substring.toLowerCase())
    );
    if (ch) {
      check.push(1);
    }
  } else if (data == null) {
    let ch = sqInList.some((substring) =>
      data?.toString()?.toLowerCase().includes(substring.toLowerCase())
    );
    if (ch) {
      check.push(1);
    }
  } else if (typeof data === "object") {
    for (const k in data) {
      const el = data[k];
      if (typeof el === "object") {
        checkDataType(el);
      } else {
        let ch = sqInList.some((substring) =>
          el?.toString()?.toLowerCase()?.includes(substring.toLowerCase())
        );
        if (ch) {
          check.push(1);
          break;
        }
      }
    }
  } else if (typeof data === "boolean") {
    let ch = sqInList.some((substring) =>
      data?.toString()?.toLowerCase().includes(substring.toLowerCase())
    );
    if (ch) {
      check.push(1);
    }
  }
  return check;
};

export const checkSqlInj = (body_data) => {
  let x = [];
  for (const key in body_data) {
    const element = body_data[key];
    let result = checkDataType(element);

    if (result.length > 0) {
      x.push(1);
    }
  }
  return {
    error: x.length > 0 ? true : false,
    message: x.length > 0 ? "The data you entered is incorrect" : "correct",
  };
};

export const tools = {}; // locale | navigate | t | ...
