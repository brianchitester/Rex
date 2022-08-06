module.exports = function override(config, env) {
  //https://mui.com/material-ui/guides/styled-engine/
  config.resolve.alias["@mui/styled-engine"] = "@mui/styled-engine-sc";

  return config;
};
