-- DropForeignKey
ALTER TABLE `instrumentos` DROP FOREIGN KEY `instrumentos_ibfk_1`;

-- DropForeignKey
ALTER TABLE `instrumentos_calibracoes` DROP FOREIGN KEY `instrumentos_calibracoes_ibfk_1`;

-- DropForeignKey
ALTER TABLE `pessoas` DROP FOREIGN KEY `pessoas_ibfk_2`;

-- DropForeignKey
ALTER TABLE `pessoas` DROP FOREIGN KEY `pessoas_ibfk_1`;

-- DropForeignKey
ALTER TABLE `pessoas` DROP FOREIGN KEY `pessoas_ibfk_3`;

-- AlterTable
ALTER TABLE `instrumentos` ADD COLUMN `faixa` VARCHAR(100) NULL,
    ADD COLUMN `resolucao` VARCHAR(100) NULL;

-- AddForeignKey
ALTER TABLE `pessoas` ADD CONSTRAINT `pessoas_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `grupos_pessoa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pessoas` ADD CONSTRAINT `pessoas_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_pessoa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pessoas` ADD CONSTRAINT `pessoas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instrumentos` ADD CONSTRAINT `instrumentos_pessoa_id_fkey` FOREIGN KEY (`pessoa_id`) REFERENCES `pessoas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instrumentos_calibracoes` ADD CONSTRAINT `instrumentos_calibracoes_instrumento_id_fkey` FOREIGN KEY (`instrumento_id`) REFERENCES `instrumentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `categorias_pessoa` DROP INDEX `categorias_pessoa.descricao_unique`,
    ADD UNIQUE INDEX `categorias_pessoa_descricao_key`(`descricao`);

-- RenameIndex
ALTER TABLE `grupos_pessoa` DROP INDEX `grupos_pessoa.descricao_unique`,
    ADD UNIQUE INDEX `grupos_pessoa_descricao_key`(`descricao`);

-- RenameIndex
ALTER TABLE `instrumentos` DROP INDEX `instrumentos.pessoa_id_tag_unique`,
    ADD UNIQUE INDEX `instrumentos_pessoa_id_tag_key`(`pessoa_id`, `tag`);

-- RenameIndex
ALTER TABLE `pessoas` DROP INDEX `pessoas.codigo_unique`,
    ADD UNIQUE INDEX `pessoas_codigo_key`(`codigo`);

-- RenameIndex
ALTER TABLE `pessoas` DROP INDEX `pessoas.cpf_cnpj_unique`,
    ADD UNIQUE INDEX `pessoas_cpf_cnpj_key`(`cpf_cnpj`);

-- RenameIndex
ALTER TABLE `usuarios` DROP INDEX `usuarios.usuario_unique`,
    ADD UNIQUE INDEX `usuarios_usuario_key`(`usuario`);
