create table Scripts
(
  id serial not null,
  accessId varchar(100) not null,
  name varchar(50) not null,
  description varchar(250) not null,
  price int,
  type int
);

create unique index Scripts_accessId_uindex
  on Scripts (accessId);

create unique index Scripts_id_uindex
  on Scripts (id);

create unique index Scripts_name_uindex
  on Scripts (name);

alter table Scripts
  add constraint Scripts_pk
    primary key (id);

