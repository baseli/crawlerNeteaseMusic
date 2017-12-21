-- 歌手表
CREATE TABLE l_singers (
  id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT ''
);

-- 专辑表
CREATE TABLE l_albums (
  id BIGINT NOT NULL,
  singer_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT '',
  comment_count INTEGER NOT NULL,
  datetime timestamp without time zone,
  cover_image varchar(255)
);

-- 歌曲表
CREATE TABLE l_songs (
  id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT '',
  singer_id BIGINT NOT NULL,
  comment_count INTEGER NOT NULL DEFAULT 0
);