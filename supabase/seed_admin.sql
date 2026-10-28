-- Crear el PRIMER admin (ejecutar en el SQL Editor, NO desde la web).
-- 1) En Supabase → Authentication → Users → "Add user" crea el usuario con correo y contraseña
--    (marca "Auto Confirm User"). 2) Reemplaza el correo y ejecuta:
insert into public.admins (user_id)
select id from auth.users where email = 'admin@tu-dominio.com'
on conflict do nothing;
