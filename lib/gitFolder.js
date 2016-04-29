const exec = require('shelljs').exec;

const cmd = (
  repo
, reference
, target
) => (
  `cd ${target}; git archive --remote=${repo} ${reference} | tar -x`
);

const gitFolder = (
  ctx
, cb
) => {
  const command = cmd(ctx.repo, ctx.reference, ctx.target);
  exec(command, {silent: true, async:true}, cb);
};

module.exports = gitFolder;
