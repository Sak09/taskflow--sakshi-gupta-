
exports.up = (pgm) => {
  pgm.createType('task_status', ['todo', 'in_progress', 'done']);
  pgm.createType('task_priority', ['low', 'medium', 'high']);

  pgm.createTable('tasks', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    title: { type: 'varchar(300)', notNull: true },
    description: { type: 'text' },
    status: { type: 'task_status', notNull: true, default: 'todo' },
    priority: { type: 'task_priority', notNull: true, default: 'medium' },
    project_id: {
      type: 'uuid',
      notNull: true,
      references: '"projects"',
      onDelete: 'CASCADE',
    },
    assignee_id: {
      type: 'uuid',
      references: '"users"',
      onDelete: 'SET NULL',
    },
    creator_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    due_date: { type: 'date' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createIndex('tasks', 'project_id');
  pgm.createIndex('tasks', 'assignee_id');
  pgm.createIndex('tasks', 'creator_id');
  pgm.createIndex('tasks', ['project_id', 'status']);
};

exports.down = (pgm) => {
  pgm.dropTable('tasks');
  pgm.dropType('task_priority');
  pgm.dropType('task_status');
};
