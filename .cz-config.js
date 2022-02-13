module.exports = {
  types: [
    { value: ':tada: init', name: 'init:     初始代码提交' },
    { value: ':sparkles: feat', name: 'feat:     增加新功能' },
    { value: ':pencil: docs', name: 'docs:     文档相关修改' },
    { value: ':construction: chore', name: 'chore:    正在建设中' },
    { value: ':bug: fix', name: 'fix:      修复bug' },
    { value: ':wrench: chore', name: 'chore:    修改配置' },
    { value: ':ambulance: fix', name: 'fix:      紧急修正' },
    { value: ':zap: perf', name: 'perf:     性能优化' },
    { value: ':lipstick: ui', name: 'ui:       更新UI' },
    { value: ':construction_worker: ci', name: 'ci:       新增CI构建' },
    { value: ':green_heart: ci', name: 'ci:       修复CI构建问题' },
    { value: ':white_check_mark: test', name: 'test:     增删测试' },
    { value: ':hammer: refactor', name: 'refactor: 	代码重构' },
    { value: ':lock: fix', name: 'fix:      修正安全问题' },
    { value: ':rocket: deploy', name: 'deploy:   部署' },
    { value: ':art: style', name: 'style:    代码样式' },
    { value: ':globe_with_meridians: i18n', name: 'i18n:     国际化' },
    { value: 'revert', name: 'revert:   版本回退' },
    { value: ':heavy_plus_sign: add', name: 'add:      新增依赖' },
    { value: ':arrow_down: minus', name: 'minus:    版本回退' },
    { value: ':fire: del', name: 'del:      删除代码/文件' },
    { value: ':pencil2: docs', name: 'docs:     文档相关' },
    {
      value: ':chart_with_upwards_trend: chore:',
      name: 'chore:    埋点相关'
    },
    { value: ':bookmark: release', name: 'release:  发布新版本' }
  ],
  scopes: [],
  messages: {
    type: '选择更改类型:\n',
    scope: '更改的范围:\n',
    subject: '简短描述:\n',
    body: '详细描述. 使用"|"换行:\n',
    footer: '关闭的issues列表. E.g.: #31, #34:\n',
    confirmCommit: '确认提交?'
  },
  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix']
}
