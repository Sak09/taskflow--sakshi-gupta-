
exports.up = (pgm) => {
  pgm.createTable('projects', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(200)', notNull: true },
    description: { type: 'text' },
    owner_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createIndex('projects', 'owner_id');
};

exports.down = (pgm) => {
  pgm.dropTable('projects');
};
