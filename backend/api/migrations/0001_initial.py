# Generated by Django 5.0.8 on 2024-08-29 19:55

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Aspnetroleclaims',
            fields=[
                ('id', models.AutoField(db_column='Id', primary_key=True, serialize=False)),
                ('claimtype', models.TextField(blank=True, db_column='ClaimType', null=True)),
                ('claimvalue', models.TextField(blank=True, db_column='ClaimValue', null=True)),
            ],
            options={
                'db_table': 'AspNetRoleClaims',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Aspnetroles',
            fields=[
                ('id', models.AutoField(db_column='Id', primary_key=True, serialize=False)),
                ('name', models.CharField(blank=True, db_column='Name', max_length=256, null=True)),
                ('normalizedname', models.CharField(blank=True, db_column='NormalizedName', max_length=256, null=True, unique=True)),
                ('concurrencystamp', models.TextField(blank=True, db_column='ConcurrencyStamp', null=True)),
            ],
            options={
                'db_table': 'AspNetRoles',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Aspnetuserclaims',
            fields=[
                ('id', models.AutoField(db_column='Id', primary_key=True, serialize=False)),
                ('claimtype', models.TextField(blank=True, db_column='ClaimType', null=True)),
                ('claimvalue', models.TextField(blank=True, db_column='ClaimValue', null=True)),
            ],
            options={
                'db_table': 'AspNetUserClaims',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Aspnetuserlogins',
            fields=[
                ('loginprovider', models.CharField(db_column='LoginProvider', max_length=128, primary_key=True, serialize=False)),
                ('providerkey', models.CharField(db_column='ProviderKey', max_length=128)),
                ('providerdisplayname', models.TextField(blank=True, db_column='ProviderDisplayName', null=True)),
            ],
            options={
                'db_table': 'AspNetUserLogins',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Aspnetusers',
            fields=[
                ('id', models.AutoField(db_column='Id', primary_key=True, serialize=False)),
                ('username', models.CharField(blank=True, db_column='UserName', max_length=256, null=True)),
                ('normalizedusername', models.CharField(blank=True, db_column='NormalizedUserName', max_length=256, null=True, unique=True)),
                ('email', models.CharField(blank=True, db_column='Email', max_length=256, null=True)),
                ('normalizedemail', models.CharField(blank=True, db_column='NormalizedEmail', max_length=256, null=True)),
                ('emailconfirmed', models.BooleanField(db_column='EmailConfirmed')),
                ('passwordhash', models.TextField(blank=True, db_column='PasswordHash', null=True)),
                ('securitystamp', models.TextField(blank=True, db_column='SecurityStamp', null=True)),
                ('concurrencystamp', models.TextField(blank=True, db_column='ConcurrencyStamp', null=True)),
                ('phonenumber', models.TextField(blank=True, db_column='PhoneNumber', null=True)),
                ('phonenumberconfirmed', models.BooleanField(db_column='PhoneNumberConfirmed')),
                ('twofactorenabled', models.BooleanField(db_column='TwoFactorEnabled')),
                ('lockoutend', models.DateTimeField(blank=True, db_column='LockoutEnd', null=True)),
                ('lockoutenabled', models.BooleanField(db_column='LockoutEnabled')),
                ('accessfailedcount', models.IntegerField(db_column='AccessFailedCount')),
            ],
            options={
                'db_table': 'AspNetUsers',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='AuthGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150, unique=True)),
            ],
            options={
                'db_table': 'auth_group',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='AuthGroupPermissions',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
            ],
            options={
                'db_table': 'auth_group_permissions',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='AuthPermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('codename', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'auth_permission',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='AuthUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128)),
                ('last_login', models.DateTimeField(blank=True, null=True)),
                ('is_superuser', models.BooleanField()),
                ('username', models.CharField(max_length=150, unique=True)),
                ('first_name', models.CharField(max_length=150)),
                ('last_name', models.CharField(max_length=150)),
                ('email', models.CharField(max_length=254)),
                ('is_staff', models.BooleanField()),
                ('is_active', models.BooleanField()),
                ('date_joined', models.DateTimeField()),
            ],
            options={
                'db_table': 'auth_user',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='AuthUserGroups',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
            ],
            options={
                'db_table': 'auth_user_groups',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='AuthUserUserPermissions',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
            ],
            options={
                'db_table': 'auth_user_user_permissions',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Composition',
            fields=[
                ('compositionid', models.IntegerField(db_column='CompositionId', primary_key=True, serialize=False)),
                ('compoundindex', models.IntegerField(db_column='CompoundIndex')),
                ('elementname', models.CharField(db_column='ElementName', max_length=2)),
                ('valueabsolute', models.FloatField(blank=True, db_column='ValueAbsolute', null=True)),
                ('valuepercent', models.FloatField(db_column='ValuePercent')),
            ],
            options={
                'db_table': 'Composition',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='DjangoAdminLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action_time', models.DateTimeField()),
                ('object_id', models.TextField(blank=True, null=True)),
                ('object_repr', models.CharField(max_length=200)),
                ('action_flag', models.SmallIntegerField()),
                ('change_message', models.TextField()),
            ],
            options={
                'db_table': 'django_admin_log',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='DjangoContentType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('app_label', models.CharField(max_length=100)),
                ('model', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'django_content_type',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='DjangoMigrations',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('app', models.CharField(max_length=255)),
                ('name', models.CharField(max_length=255)),
                ('applied', models.DateTimeField()),
            ],
            options={
                'db_table': 'django_migrations',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='DjangoSession',
            fields=[
                ('session_key', models.CharField(max_length=40, primary_key=True, serialize=False)),
                ('session_data', models.TextField()),
                ('expire_date', models.DateTimeField()),
            ],
            options={
                'db_table': 'django_session',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Efmigrationshistory',
            fields=[
                ('migrationid', models.CharField(db_column='MigrationId', max_length=150, primary_key=True, serialize=False)),
                ('productversion', models.CharField(db_column='ProductVersion', max_length=32)),
            ],
            options={
                'db_table': '__EFMigrationsHistory',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Elementinfo',
            fields=[
                ('elementid', models.IntegerField(db_column='ElementId', primary_key=True, serialize=False)),
                ('elementname', models.CharField(db_column='ElementName', max_length=2, unique=True)),
            ],
            options={
                'db_table': 'ElementInfo',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Objectinfo',
            fields=[
                ('objectid', models.IntegerField(db_column='ObjectId', primary_key=True, serialize=False)),
                ('field_created', models.DateTimeField(db_column='_created')),
                ('field_updated', models.DateTimeField(db_column='_updated')),
                ('sortcode', models.IntegerField(db_column='SortCode')),
                ('accesscontrol', models.IntegerField(db_column='AccessControl')),
                ('ispublished', models.BooleanField(db_column='IsPublished')),
                ('externalid', models.IntegerField(blank=True, db_column='ExternalId', null=True)),
                ('objectname', models.CharField(db_column='ObjectName', max_length=512)),
                ('objectnameurl', models.CharField(db_column='ObjectNameUrl', max_length=256)),
                ('objectfilepath', models.CharField(blank=True, db_column='ObjectFilePath', max_length=256, null=True)),
                ('objectfilehash', models.CharField(blank=True, db_column='ObjectFileHash', max_length=128, null=True)),
                ('objectdescription', models.CharField(blank=True, db_column='ObjectDescription', max_length=1024, null=True)),
            ],
            options={
                'db_table': 'ObjectInfo',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Objectlinkobject',
            fields=[
                ('objectlinkobjectid', models.AutoField(db_column='ObjectLinkObjectId', primary_key=True, serialize=False)),
                ('sortcode', models.IntegerField(db_column='SortCode')),
                ('field_created', models.DateTimeField(db_column='_created')),
                ('field_updated', models.DateTimeField(db_column='_updated')),
            ],
            options={
                'db_table': 'ObjectLinkObject',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Objectlinkrubric',
            fields=[
                ('objectlinkrubricid', models.AutoField(db_column='ObjectLinkRubricId', primary_key=True, serialize=False)),
                ('sortcode', models.IntegerField(db_column='SortCode')),
                ('field_created', models.DateTimeField(db_column='_created')),
                ('field_updated', models.DateTimeField(db_column='_updated')),
            ],
            options={
                'db_table': 'ObjectLinkRubric',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Propertybigstring',
            fields=[
                ('propertybigstringid', models.AutoField(db_column='PropertyBigStringId', primary_key=True, serialize=False)),
                ('sortcode', models.IntegerField(db_column='SortCode')),
                ('field_created', models.DateTimeField(db_column='_created')),
                ('field_updated', models.DateTimeField(db_column='_updated')),
                ('row', models.IntegerField(blank=True, db_column='Row', null=True)),
                ('value', models.TextField(db_column='Value')),
                ('propertyname', models.CharField(db_column='PropertyName', max_length=256)),
                ('comment', models.CharField(blank=True, db_column='Comment', max_length=256, null=True)),
            ],
            options={
                'db_table': 'PropertyBigString',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Propertyfloat',
            fields=[
                ('propertyfloatid', models.AutoField(db_column='PropertyFloatId', primary_key=True, serialize=False)),
                ('sortcode', models.IntegerField(db_column='SortCode')),
                ('field_created', models.DateTimeField(db_column='_created')),
                ('field_updated', models.DateTimeField(db_column='_updated')),
                ('row', models.IntegerField(blank=True, db_column='Row', null=True)),
                ('value', models.FloatField(db_column='Value')),
                ('valueepsilon', models.FloatField(blank=True, db_column='ValueEpsilon', null=True)),
                ('propertyname', models.CharField(db_column='PropertyName', max_length=256)),
                ('comment', models.CharField(blank=True, db_column='Comment', max_length=256, null=True)),
            ],
            options={
                'db_table': 'PropertyFloat',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Propertyint',
            fields=[
                ('propertyintid', models.AutoField(db_column='PropertyIntId', primary_key=True, serialize=False)),
                ('sortcode', models.IntegerField(db_column='SortCode')),
                ('field_created', models.DateTimeField(db_column='_created')),
                ('field_updated', models.DateTimeField(db_column='_updated')),
                ('row', models.IntegerField(blank=True, db_column='Row', null=True)),
                ('value', models.BigIntegerField(db_column='Value')),
                ('propertyname', models.CharField(db_column='PropertyName', max_length=256)),
                ('comment', models.CharField(blank=True, db_column='Comment', max_length=256, null=True)),
            ],
            options={
                'db_table': 'PropertyInt',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Propertystring',
            fields=[
                ('propertystringid', models.AutoField(db_column='PropertyStringId', primary_key=True, serialize=False)),
                ('sortcode', models.IntegerField(db_column='SortCode')),
                ('field_created', models.DateTimeField(db_column='_created')),
                ('field_updated', models.DateTimeField(db_column='_updated')),
                ('row', models.IntegerField(blank=True, db_column='Row', null=True)),
                ('value', models.CharField(db_column='Value', max_length=4096)),
                ('propertyname', models.CharField(db_column='PropertyName', max_length=256)),
                ('comment', models.CharField(blank=True, db_column='Comment', max_length=256, null=True)),
            ],
            options={
                'db_table': 'PropertyString',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Rubricinfo',
            fields=[
                ('rubricid', models.IntegerField(db_column='RubricId', primary_key=True, serialize=False)),
                ('field_created', models.DateTimeField(db_column='_created')),
                ('field_updated', models.DateTimeField(db_column='_updated')),
                ('level', models.IntegerField(db_column='Level')),
                ('leafflag', models.IntegerField(db_column='LeafFlag')),
                ('flags', models.IntegerField(db_column='Flags')),
                ('sortcode', models.IntegerField(db_column='SortCode')),
                ('accesscontrol', models.IntegerField(db_column='AccessControl')),
                ('ispublished', models.BooleanField(db_column='IsPublished')),
                ('rubricname', models.CharField(db_column='RubricName', max_length=256)),
                ('rubricnameurl', models.CharField(db_column='RubricNameUrl', max_length=256)),
                ('rubricpath', models.CharField(db_column='RubricPath', max_length=256)),
            ],
            options={
                'db_table': 'RubricInfo',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Sysdiagrams',
            fields=[
                ('name', models.CharField(max_length=128)),
                ('principal_id', models.IntegerField()),
                ('diagram_id', models.AutoField(primary_key=True, serialize=False)),
                ('version', models.IntegerField(blank=True, null=True)),
                ('definition', models.BinaryField(blank=True, max_length='max', null=True)),
            ],
            options={
                'db_table': 'sysdiagrams',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Tenant',
            fields=[
                ('tenantid', models.IntegerField(db_column='TenantId', primary_key=True, serialize=False)),
                ('field_date', models.DateTimeField(db_column='_date')),
                ('language', models.CharField(blank=True, db_column='Language', max_length=32, null=True)),
                ('tenanturl', models.CharField(db_column='TenantUrl', max_length=32)),
                ('tenantname', models.CharField(db_column='TenantName', max_length=128)),
                ('accesscontrol', models.IntegerField(db_column='AccessControl')),
            ],
            options={
                'db_table': 'Tenant',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Transferinfprojects',
            fields=[
                ('id', models.AutoField(db_column='Id', primary_key=True, serialize=False)),
                ('dt', models.DateTimeField(blank=True, null=True)),
                ('srcobjectid', models.IntegerField(blank=True, db_column='srcObjectId', null=True)),
                ('dstobjectid', models.IntegerField(blank=True, db_column='dstObjectId', null=True)),
                ('typeid', models.IntegerField(blank=True, db_column='TypeId', null=True)),
                ('srcrubricid', models.IntegerField(blank=True, db_column='srcRubricId', null=True)),
                ('dstrubricid', models.IntegerField(blank=True, db_column='dstRubricId', null=True)),
                ('dstuserid', models.IntegerField(blank=True, db_column='dstUserId', null=True)),
                ('step', models.IntegerField(blank=True, null=True)),
                ('action', models.CharField(blank=True, db_collation='Latin1_General_100_CI_AS_KS_SC_UTF8', max_length=64, null=True)),
                ('comment', models.CharField(blank=True, db_collation='Latin1_General_100_CI_AS_KS_SC_UTF8', max_length=1024, null=True)),
            ],
            options={
                'db_table': '_TransferInfProjects',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Typeinfo',
            fields=[
                ('typeid', models.IntegerField(db_column='TypeId', primary_key=True, serialize=False)),
                ('ishierarchical', models.BooleanField(db_column='IsHierarchical')),
                ('typeidforrubric', models.IntegerField(blank=True, db_column='TypeIdForRubric', null=True)),
                ('typename', models.CharField(db_column='TypeName', max_length=64, unique=True)),
                ('tablename', models.CharField(db_column='TableName', max_length=64)),
                ('urlprefix', models.CharField(db_column='UrlPrefix', max_length=64)),
                ('typecomment', models.CharField(blank=True, db_column='TypeComment', max_length=256, null=True)),
                ('validationschema', models.CharField(blank=True, db_column='ValidationSchema', max_length=256, null=True)),
                ('dataschema', models.CharField(blank=True, db_column='DataSchema', max_length=256, null=True)),
                ('settingsjson', models.CharField(blank=True, db_column='SettingsJson', max_length=8000, null=True)),
                ('filerequired', models.BooleanField(db_column='FileRequired')),
                ('field_date', models.DateTimeField(db_column='_date')),
            ],
            options={
                'db_table': 'TypeInfo',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Aspnetuserroles',
            fields=[
                ('userid', models.OneToOneField(db_column='UserId', on_delete=django.db.models.deletion.DO_NOTHING, primary_key=True, serialize=False, to='api.aspnetusers')),
            ],
            options={
                'db_table': 'AspNetUserRoles',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Aspnetusertokens',
            fields=[
                ('userid', models.OneToOneField(db_column='UserId', on_delete=django.db.models.deletion.DO_NOTHING, primary_key=True, serialize=False, to='api.aspnetusers')),
                ('loginprovider', models.CharField(db_column='LoginProvider', max_length=128)),
                ('name', models.CharField(db_column='Name', max_length=128)),
                ('value', models.TextField(blank=True, db_column='Value', null=True)),
            ],
            options={
                'db_table': 'AspNetUserTokens',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Handover',
            fields=[
                ('handoverid', models.OneToOneField(db_column='HandoverId', on_delete=django.db.models.deletion.DO_NOTHING, primary_key=True, serialize=False, to='api.objectinfo')),
                ('destinationconfirmed', models.DateTimeField(blank=True, db_column='DestinationConfirmed', null=True)),
                ('destinationcomments', models.CharField(blank=True, db_column='DestinationComments', max_length=128, null=True)),
                ('json', models.TextField(blank=True, db_column='Json', null=True)),
                ('amount', models.FloatField(blank=True, db_column='Amount', null=True)),
                ('measurementunit', models.CharField(blank=True, db_column='MeasurementUnit', max_length=32, null=True)),
            ],
            options={
                'db_table': 'Handover',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Reference',
            fields=[
                ('referenceid', models.OneToOneField(db_column='ReferenceId', on_delete=django.db.models.deletion.DO_NOTHING, primary_key=True, serialize=False, to='api.objectinfo')),
                ('authors', models.CharField(db_column='Authors', max_length=512)),
                ('title', models.CharField(db_column='Title', max_length=1024)),
                ('journal', models.CharField(blank=True, db_column='Journal', max_length=256, null=True)),
                ('year', models.IntegerField(db_column='Year')),
                ('volume', models.CharField(blank=True, db_column='Volume', max_length=32, null=True)),
                ('number', models.CharField(blank=True, db_column='Number', max_length=32, null=True)),
                ('startpage', models.CharField(blank=True, db_column='StartPage', max_length=32, null=True)),
                ('endpage', models.CharField(blank=True, db_column='EndPage', max_length=32, null=True)),
                ('doi', models.CharField(blank=True, db_column='DOI', max_length=256, null=True)),
                ('url', models.CharField(blank=True, db_column='URL', max_length=256, null=True)),
                ('bibtex', models.CharField(blank=True, db_column='BibTeX', max_length=4096, null=True)),
            ],
            options={
                'db_table': 'Reference',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Sample',
            fields=[
                ('sampleid', models.OneToOneField(db_column='SampleId', on_delete=django.db.models.deletion.DO_NOTHING, primary_key=True, serialize=False, to='api.objectinfo')),
                ('elemnumber', models.IntegerField(db_column='ElemNumber')),
                ('elements', models.CharField(db_column='Elements', max_length=256)),
            ],
            options={
                'db_table': 'Sample',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Rubricinfoadds',
            fields=[
                ('rubricid', models.OneToOneField(db_column='RubricId', on_delete=django.db.models.deletion.DO_NOTHING, primary_key=True, serialize=False, to='api.rubricinfo')),
                ('rubrictext', models.TextField(db_column='RubricText')),
            ],
            options={
                'db_table': 'RubricInfoAdds',
                'managed': False,
            },
        ),
    ]
