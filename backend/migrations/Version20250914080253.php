<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250914080253 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE "like" (id SERIAL NOT NULL, post_id INT NOT NULL, user_id_id INT DEFAULT NULL, guest_token VARCHAR(255) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_AC6340B34B89032C ON "like" (post_id)');
        $this->addSql('CREATE INDEX IDX_AC6340B39D86650F ON "like" (user_id_id)');
        $this->addSql('COMMENT ON COLUMN "like".created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE "post" (id SERIAL NOT NULL, author_id_id INT DEFAULT NULL, content VARCHAR(255) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, author_token VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_5A8A6C8D69CCBE9A ON "post" (author_id_id)');
        $this->addSql('COMMENT ON COLUMN "post".created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE tag (id SERIAL NOT NULL, name VARCHAR(30) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE tag_post (tag_id INT NOT NULL, post_id INT NOT NULL, PRIMARY KEY(tag_id, post_id))');
        $this->addSql('CREATE INDEX IDX_B485D33BBAD26311 ON tag_post (tag_id)');
        $this->addSql('CREATE INDEX IDX_B485D33B4B89032C ON tag_post (post_id)');
        $this->addSql('CREATE TABLE "user" (id SERIAL NOT NULL, username VARCHAR(50) NOT NULL, email VARCHAR(254) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN "user".created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE "like" ADD CONSTRAINT FK_AC6340B34B89032C FOREIGN KEY (post_id) REFERENCES "post" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE "like" ADD CONSTRAINT FK_AC6340B39D86650F FOREIGN KEY (user_id_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE "post" ADD CONSTRAINT FK_5A8A6C8D69CCBE9A FOREIGN KEY (author_id_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE tag_post ADD CONSTRAINT FK_B485D33BBAD26311 FOREIGN KEY (tag_id) REFERENCES tag (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE tag_post ADD CONSTRAINT FK_B485D33B4B89032C FOREIGN KEY (post_id) REFERENCES "post" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE "like" DROP CONSTRAINT FK_AC6340B34B89032C');
        $this->addSql('ALTER TABLE "like" DROP CONSTRAINT FK_AC6340B39D86650F');
        $this->addSql('ALTER TABLE "post" DROP CONSTRAINT FK_5A8A6C8D69CCBE9A');
        $this->addSql('ALTER TABLE tag_post DROP CONSTRAINT FK_B485D33BBAD26311');
        $this->addSql('ALTER TABLE tag_post DROP CONSTRAINT FK_B485D33B4B89032C');
        $this->addSql('DROP TABLE "like"');
        $this->addSql('DROP TABLE "post"');
        $this->addSql('DROP TABLE tag');
        $this->addSql('DROP TABLE tag_post');
        $this->addSql('DROP TABLE "user"');
    }
}
