create table scripts
(
  id serial not null,
  contentId varchar(100) not null,
  developerUserId uuid not null,
  name varchar(50) not null,
  description varchar(250) not null,
  price int,
  type int,
  enabled boolean default false not null,
  dateAdded timestamptz not null,
  lastUpdate timestamptz
);

create unique index Scripts_contentId_uindex
  on Scripts (contentId);

create unique index Scripts_id_uindex
  on Scripts (id);

create unique index Scripts_name_uindex
  on Scripts (name);

alter table Scripts
  add constraint Scripts_pk
    primary key (id);

create table script_access
(
  id serial not null,
  userId uuid not null,
  scriptId int not null,
  dateAdded timestamp not null,
  expirationDate timestamp not null,
  addedByUserId uuid
);

create unique index script_access_id_uindex
  on script_access (id);

alter table script_access
  add constraint script_access_pk
    primary key (id);



