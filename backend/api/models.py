from django.db import models


class Aspnetroleclaims(models.Model):
    id = models.AutoField(primary_key=True, db_column='Id')
    roleid = models.ForeignKey('Aspnetroles', models.DO_NOTHING, db_column='RoleId')
    claimtype = models.TextField(db_column='ClaimType', blank=True, null=True)
    claimvalue = models.TextField(db_column='ClaimValue', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'AspNetRoleClaims'


class Aspnetroles(models.Model):
    id = models.AutoField(primary_key=True, db_column='Id')
    name = models.CharField(db_column='Name', max_length=256, blank=True, null=True)
    normalizedname = models.CharField(db_column='NormalizedName', unique=True, max_length=256, blank=True, null=True)
    concurrencystamp = models.TextField(db_column='ConcurrencyStamp', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'AspNetRoles'


class Aspnetuserclaims(models.Model):
    id = models.AutoField(primary_key=True, db_column='Id')
    userid = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='UserId')
    claimtype = models.TextField(db_column='ClaimType', blank=True, null=True)
    claimvalue = models.TextField(db_column='ClaimValue', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'AspNetUserClaims'


class Aspnetuserlogins(models.Model):
    loginprovider = models.CharField(primary_key=True, db_column='LoginProvider', max_length=128)
    providerkey = models.CharField(db_column='ProviderKey', max_length=128)
    providerdisplayname = models.TextField(db_column='ProviderDisplayName', blank=True, null=True)
    userid = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='UserId')

    class Meta:
        managed = False
        db_table = 'AspNetUserLogins'
        unique_together = (('loginprovider', 'providerkey'),)


class Aspnetuserroles(models.Model):
    userid = models.OneToOneField('Aspnetusers', models.DO_NOTHING, primary_key=True, db_column='UserId')
    roleid = models.ForeignKey(Aspnetroles, models.DO_NOTHING, db_column='RoleId')

    class Meta:
        managed = False
        db_table = 'AspNetUserRoles'
        unique_together = (('userid', 'roleid'),)


class Aspnetusertokens(models.Model):
    userid = models.OneToOneField('Aspnetusers', models.DO_NOTHING, primary_key=True, db_column='UserId')
    loginprovider = models.CharField(db_column='LoginProvider', max_length=128)
    name = models.CharField(db_column='Name', max_length=128)
    value = models.TextField(db_column='Value', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'AspNetUserTokens'
        unique_together = (('userid', 'loginprovider', 'name'),)


class Aspnetusers(models.Model):
    id = models.AutoField(primary_key=True, db_column='Id')
    username = models.CharField(db_column='UserName', max_length=256, blank=True, null=True)
    normalizedusername = models.CharField(db_column='NormalizedUserName', unique=True, max_length=256, blank=True, null=True)
    email = models.CharField(db_column='Email', max_length=256, blank=True, null=True)
    normalizedemail = models.CharField(db_column='NormalizedEmail', max_length=256, blank=True, null=True)
    emailconfirmed = models.BooleanField(db_column='EmailConfirmed')
    passwordhash = models.TextField(db_column='PasswordHash', blank=True, null=True)
    securitystamp = models.TextField(db_column='SecurityStamp', blank=True, null=True)
    concurrencystamp = models.TextField(db_column='ConcurrencyStamp', blank=True, null=True)
    phonenumber = models.TextField(db_column='PhoneNumber', blank=True, null=True)
    phonenumberconfirmed = models.BooleanField(db_column='PhoneNumberConfirmed')
    twofactorenabled = models.BooleanField(db_column='TwoFactorEnabled')
    lockoutend = models.DateTimeField(db_column='LockoutEnd', blank=True, null=True)
    lockoutenabled = models.BooleanField(db_column='LockoutEnabled')
    accessfailedcount = models.IntegerField(db_column='AccessFailedCount')

    class Meta:
        managed = False
        db_table = 'AspNetUsers'



class Composition(models.Model):
    compositionid = models.IntegerField(primary_key=True, db_column='CompositionId')
    sampleid = models.ForeignKey('Sample', models.DO_NOTHING, db_column='sampleid')
    compoundindex = models.IntegerField(db_column='CompoundIndex')
    elementname = models.CharField(db_column='ElementName', max_length=2)
    valueabsolute = models.FloatField(db_column='ValueAbsolute', blank=True, null=True)
    valuepercent = models.FloatField(db_column='ValuePercent')

    class Meta:
        managed = False
        db_table = 'Composition'
        unique_together = (('sampleid', 'elementname'),)


class Elementinfo(models.Model):
    elementid = models.IntegerField(primary_key=True, db_column='ElementId')
    elementname = models.CharField(db_column='ElementName', unique=True, max_length=2)

    class Meta:
        managed = False
        db_table = 'ElementInfo'

class Handover(models.Model):
    handoverid = models.OneToOneField('Objectinfo', models.DO_NOTHING, primary_key=True, db_column='HandoverId')
    sampleobjectid = models.ForeignKey('Objectinfo', models.DO_NOTHING, db_column='SampleObjectId', related_name='handover_sampleobjectid_set')
    destinationuserid = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='DestinationUserId')
    destinationconfirmed = models.DateTimeField(db_column='DestinationConfirmed', blank=True, null=True)  # Confirmation time
    destinationcomments = models.CharField(db_column='DestinationComments', max_length=128, blank=True, null=True)
    json = models.TextField(db_column='Json', blank=True, null=True)
    amount = models.FloatField(db_column='Amount', blank=True, null=True)
    measurementunit = models.CharField(db_column='MeasurementUnit', max_length=32, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Handover'



class Objectinfo(models.Model):
    objectid = models.IntegerField(primary_key=True, db_column='ObjectId')
    tenantid = models.ForeignKey('Tenant', models.DO_NOTHING, db_column='TenantId')
    field_created = models.DateTimeField(db_column='_created')
    field_createdby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_createdBy')
    field_updated = models.DateTimeField(db_column='_updated')
    field_updatedby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_updatedBy', related_name='objectinfo_field_updatedby_set')
    typeid = models.ForeignKey('Typeinfo', models.DO_NOTHING, db_column='TypeId')
    rubricid = models.ForeignKey('Rubricinfo', models.DO_NOTHING, db_column='RubricId', blank=True, null=True)
    sortcode = models.IntegerField(db_column='SortCode')
    accesscontrol = models.IntegerField(db_column='AccessControl')
    ispublished = models.BooleanField(db_column='IsPublished')
    externalid = models.IntegerField(db_column='ExternalId', blank=True, null=True)
    objectname = models.CharField(db_column='ObjectName', max_length=512)
    objectnameurl = models.CharField(db_column='ObjectNameUrl', max_length=256)
    objectfilepath = models.CharField(db_column='ObjectFilePath', max_length=256, blank=True, null=True)
    objectfilehash = models.CharField(db_column='ObjectFileHash', max_length=128, blank=True, null=True)
    objectdescription = models.CharField(db_column='ObjectDescription', max_length=1024, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ObjectInfo'
        unique_together = (('tenantid', 'objectnameurl'), ('tenantid', 'objectfilehash'), ('tenantid', 'typeid', 'objectname'),)


class Objectlinkobject(models.Model):
    objectlinkobjectid = models.AutoField(primary_key=True, db_column='ObjectLinkObjectId')
    objectid = models.ForeignKey(Objectinfo, models.DO_NOTHING, db_column='ObjectId')
    linkedobjectid = models.ForeignKey(Objectinfo, models.DO_NOTHING, db_column='LinkedObjectId', related_name='objectlinkobject_linkedobjectid_set')
    sortcode = models.IntegerField(db_column='SortCode')
    field_created = models.DateTimeField(db_column='_created')
    field_createdby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_createdBy')
    field_updated = models.DateTimeField(db_column='_updated')
    field_updatedby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_updatedBy', related_name='objectlinkobject_field_updatedby_set')
    linktypeobjectid = models.ForeignKey(Objectinfo, models.DO_NOTHING, db_column='LinkTypeObjectId', related_name='objectlinkobject_linktypeobjectid_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ObjectLinkObject'
        unique_together = (('objectid', 'linkedobjectid', 'linktypeobjectid'),)


class Objectlinkrubric(models.Model):
    objectlinkrubricid = models.AutoField(primary_key=True, db_column='ObjectLinkRubricId')
    rubricid = models.ForeignKey('Rubricinfo', models.DO_NOTHING, db_column='RubricId')
    objectid = models.ForeignKey(Objectinfo, models.DO_NOTHING, db_column='ObjectId')
    sortcode = models.IntegerField(db_column='SortCode')
    field_created = models.DateTimeField(db_column='_created')
    field_createdby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_createdBy')
    field_updated = models.DateTimeField(db_column='_updated')
    field_updatedby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_updatedBy', related_name='objectlinkrubric_field_updatedby_set')

    class Meta:
        managed = False
        db_table = 'ObjectLinkRubric'
        unique_together = (('objectid', 'rubricid'),)


class Propertybigstring(models.Model):
    propertybigstringid = models.AutoField(primary_key=True, db_column='PropertyBigStringId')
    objectid = models.ForeignKey(Objectinfo, models.DO_NOTHING, db_column='ObjectId')
    sortcode = models.IntegerField(db_column='SortCode')
    field_created = models.DateTimeField(db_column='_created')
    field_createdby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_createdBy')
    field_updated = models.DateTimeField(db_column='_updated')
    field_updatedby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_updatedBy', related_name='propertybigstring_field_updatedby_set')
    row = models.IntegerField(db_column='Row', blank=True, null=True)
    value = models.TextField(db_column='Value')
    propertyname = models.CharField(db_column='PropertyName', max_length=256)
    comment = models.CharField(db_column='Comment', max_length=256, blank=True, null=True)
    sourceobjectid = models.ForeignKey(Objectinfo, models.DO_NOTHING, db_column='SourceObjectId', related_name='propertybigstring_sourceobjectid_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PropertyBigString'
        unique_together = (('objectid', 'row', 'propertyname'),)


class Propertyfloat(models.Model):
    propertyfloatid = models.AutoField(primary_key=True, db_column='PropertyFloatId')
    objectid = models.ForeignKey(Objectinfo, models.DO_NOTHING, db_column='ObjectId')
    sortcode = models.IntegerField(db_column='SortCode')
    field_created = models.DateTimeField(db_column='_created')
    field_createdby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_createdBy')
    field_updated = models.DateTimeField(db_column='_updated')
    field_updatedby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_updatedBy', related_name='propertyfloat_field_updatedby_set')
    row = models.IntegerField(db_column='Row', blank=True, null=True)
    value = models.FloatField(db_column='Value')
    valueepsilon = models.FloatField(db_column='ValueEpsilon', blank=True, null=True)
    propertyname = models.CharField(db_column='PropertyName', max_length=256)
    comment = models.CharField(db_column='Comment', max_length=256, blank=True, null=True)
    sourceobjectid = models.ForeignKey(Objectinfo, models.DO_NOTHING, db_column='SourceObjectId', related_name='propertyfloat_sourceobjectid_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PropertyFloat'
        unique_together = (('objectid', 'row', 'propertyname'),)



class Propertyint(models.Model):
    propertyintid = models.AutoField(primary_key=True, db_column='PropertyIntId')
    objectid = models.ForeignKey('Objectinfo', models.DO_NOTHING, db_column='ObjectId')
    sortcode = models.IntegerField(db_column='SortCode')
    field_created = models.DateTimeField(db_column='_created')
    field_createdby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_createdBy')
    field_updated = models.DateTimeField(db_column='_updated')
    field_updatedby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_updatedBy', related_name='propertyint_field_updatedby_set')
    row = models.IntegerField(db_column='Row', blank=True, null=True)
    value = models.BigIntegerField(db_column='Value')
    propertyname = models.CharField(db_column='PropertyName', max_length=256)
    comment = models.CharField(db_column='Comment', max_length=256, blank=True, null=True)
    sourceobjectid = models.ForeignKey('Objectinfo', models.DO_NOTHING, db_column='SourceObjectId', related_name='propertyint_sourceobjectid_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PropertyInt'
        unique_together = (('objectid', 'row', 'propertyname'),)


class Propertystring(models.Model):
    propertystringid = models.AutoField(primary_key=True, db_column='PropertyStringId')
    objectid = models.ForeignKey('Objectinfo', models.DO_NOTHING, db_column='ObjectId')
    sortcode = models.IntegerField(db_column='SortCode')
    field_created = models.DateTimeField(db_column='_created')
    field_createdby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_createdBy')
    field_updated = models.DateTimeField(db_column='_updated')
    field_updatedby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_updatedBy', related_name='propertystring_field_updatedby_set')
    row = models.IntegerField(db_column='Row', blank=True, null=True)
    value = models.CharField(db_column='Value', max_length=4096)
    propertyname = models.CharField(db_column='PropertyName', max_length=256)
    comment = models.CharField(db_column='Comment', max_length=256, blank=True, null=True)
    sourceobjectid = models.ForeignKey('Objectinfo', models.DO_NOTHING, db_column='SourceObjectId', related_name='propertystring_sourceobjectid_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'PropertyString'
        unique_together = (('objectid', 'row', 'propertyname'),)


class Reference(models.Model):
    referenceid = models.OneToOneField('Objectinfo', models.DO_NOTHING, primary_key=True, db_column='ReferenceId')
    authors = models.CharField(db_column='Authors', max_length=512)
    title = models.CharField(db_column='Title', max_length=1024)
    journal = models.CharField(db_column='Journal', max_length=256, blank=True, null=True)
    year = models.IntegerField(db_column='Year')
    volume = models.CharField(db_column='Volume', max_length=32, blank=True, null=True)
    number = models.CharField(db_column='Number', max_length=32, blank=True, null=True)
    startpage = models.CharField(db_column='StartPage', max_length=32, blank=True, null=True)
    endpage = models.CharField(db_column='EndPage', max_length=32, blank=True, null=True)
    doi = models.CharField(db_column='DOI', max_length=256, blank=True, null=True)
    url = models.CharField(db_column='URL', max_length=256, blank=True, null=True)
    bibtex = models.CharField(db_column='BibTeX', max_length=4096, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Reference'


class Rubricinfo(models.Model):
    rubricid = models.IntegerField(primary_key=True, db_column='RubricId')
    tenantid = models.ForeignKey('Tenant', models.DO_NOTHING, db_column='TenantId')
    field_created = models.DateTimeField(db_column='_created')
    field_createdby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_createdBy')
    field_updated = models.DateTimeField(db_column='_updated')
    field_updatedby = models.ForeignKey('Aspnetusers', models.DO_NOTHING, db_column='_updatedBy', related_name='rubricinfo_field_updatedby_set')
    typeid = models.ForeignKey('Typeinfo', models.DO_NOTHING, db_column='TypeId')
    parentid = models.ForeignKey('self', models.DO_NOTHING, db_column='ParentId', blank=True, null=True)
    level = models.IntegerField(db_column='Level')
    leafflag = models.IntegerField(db_column='LeafFlag')
    flags = models.IntegerField(db_column='Flags')
    sortcode = models.IntegerField(db_column='SortCode')
    accesscontrol = models.IntegerField(db_column='AccessControl')
    ispublished = models.BooleanField(db_column='IsPublished')
    rubricname = models.CharField(db_column='RubricName', max_length=256)
    rubricnameurl = models.CharField(db_column='RubricNameUrl', max_length=256)
    rubricpath = models.CharField(db_column='RubricPath', max_length=256)

    class Meta:
        managed = False
        db_table = 'RubricInfo'
        unique_together = (('tenantid', 'rubricnameurl'),)


class Rubricinfoadds(models.Model):
    rubricid = models.OneToOneField('Rubricinfo', models.DO_NOTHING, primary_key=True, db_column='RubricId')
    rubrictext = models.TextField(db_column='RubricText')

    class Meta:
        managed = False
        db_table = 'RubricInfoAdds'


class Sample(models.Model):
    sampleid = models.OneToOneField('Objectinfo', models.DO_NOTHING, primary_key=True, db_column='SampleId')
    elemnumber = models.IntegerField(db_column='ElemNumber')
    elements = models.CharField(db_column='Elements', max_length=256)

    class Meta:
        managed = False
        db_table = 'Sample'


class Tenant(models.Model):
    tenantid = models.IntegerField(primary_key=True, db_column='TenantId')
    field_date = models.DateTimeField(db_column='_date')
    language = models.CharField(db_column='Language', max_length=32, blank=True, null=True)
    tenanturl = models.CharField(db_column='TenantUrl', max_length=32)
    tenantname = models.CharField(db_column='TenantName', max_length=128)
    accesscontrol = models.IntegerField(db_column='AccessControl')

    class Meta:
        managed = False
        db_table = 'Tenant'


class Typeinfo(models.Model):
    typeid = models.IntegerField(primary_key=True, db_column='TypeId')
    ishierarchical = models.BooleanField(db_column='IsHierarchical')
    typeidforrubric = models.IntegerField(db_column='TypeIdForRubric', blank=True, null=True)
    typename = models.CharField(db_column='TypeName', unique=True, max_length=64)
    tablename = models.CharField(db_column='TableName', max_length=64)
    urlprefix = models.CharField(db_column='UrlPrefix', max_length=64)
    typecomment = models.CharField(db_column='TypeComment', max_length=256, blank=True, null=True)
    validationschema = models.CharField(db_column='ValidationSchema', max_length=256, blank=True, null=True)
    dataschema = models.CharField(db_column='DataSchema', max_length=256, blank=True, null=True)
    settingsjson = models.CharField(db_column='SettingsJson', max_length=8000, blank=True, null=True)
    filerequired = models.BooleanField(db_column='FileRequired')
    field_date = models.DateTimeField(db_column='_date')

    class Meta:
        managed = False
        db_table = 'TypeInfo'


class Transferinfprojects(models.Model):
    id = models.AutoField(db_column='Id', primary_key=True)  # Field name made lowercase.
    dt = models.DateTimeField(blank=True, null=True)
    srcobjectid = models.IntegerField(db_column='srcObjectId', blank=True, null=True)  # Field name made lowercase.
    dstobjectid = models.IntegerField(db_column='dstObjectId', blank=True, null=True)  # Field name made lowercase.
    typeid = models.IntegerField(db_column='TypeId', blank=True, null=True)  # Field name made lowercase.
    srcrubricid = models.IntegerField(db_column='srcRubricId', blank=True, null=True)  # Field name made lowercase.
    dstrubricid = models.IntegerField(db_column='dstRubricId', blank=True, null=True)  # Field name made lowercase.
    dstuserid = models.IntegerField(db_column='dstUserId', blank=True, null=True)  # Field name made lowercase.
    step = models.IntegerField(blank=True, null=True)
    action = models.CharField(max_length=64, db_collation='Latin1_General_100_CI_AS_KS_SC_UTF8', blank=True, null=True)
    comment = models.CharField(max_length=1024, db_collation='Latin1_General_100_CI_AS_KS_SC_UTF8', blank=True, null=True)

    class Meta:
        managed = False
        db_table = '_TransferInfProjects'



class Efmigrationshistory(models.Model):
    migrationid = models.CharField(primary_key=True, db_column='MigrationId', max_length=150)
    productversion = models.CharField(db_column='ProductVersion', max_length=32)

    class Meta:
        managed = False
        db_table = '__EFMigrationsHistory'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey('AuthGroup', models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey('AuthUser', models.DO_NOTHING)
    group = models.ForeignKey('AuthGroup', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey('AuthUser', models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('AuthUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Sysdiagrams(models.Model):
    name = models.CharField(max_length=128)
    principal_id = models.IntegerField()
    diagram_id = models.AutoField(primary_key=True)
    version = models.IntegerField(blank=True, null=True)
    definition = models.BinaryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'sysdiagrams'
        unique_together = (('principal_id', 'name'),)


class Workflow(models.Model):
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class Stage(models.Model):
    workflow = models.ForeignKey(Workflow, related_name='stages', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    typenames = models.JSONField(default=list)  # This will store a list of typenames (e.g., JSON format)
    steps = models.JSONField(default=list, blank=True)  # Store the steps of the stage in JSON format

    def __str__(self):
        return self.name
