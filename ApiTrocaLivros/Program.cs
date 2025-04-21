using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using ApiTrocaLivros.Data;
using ApiTrocaLivros.Services;
using ApiTrocaLivros.Security;

var builder = WebApplication.CreateBuilder(args);

// 1) Banco de dados
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL")));

// 2) Registra serviços e HttpContextAccessor
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<BookService>();
builder.Services.AddScoped<TradeService>();

// 3) Configura autenticação JWT
var jwtService = new JwtService();
jwtService.ConfigureJwtAuthentication(builder.Services);

// 4) Controllers + JSON options (para serializar enums como strings)
builder.Services
    .AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// 5) Swagger/OpenAPI, incluindo esquema Bearer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "API TrocaLivros", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Insira o token JWT assim: Bearer {seu_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme 
            {
                Reference = new OpenApiReference 
                { 
                    Type = ReferenceType.SecurityScheme, 
                    Id = "Bearer" 
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 6) Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ordem correta: autenticacao primeiro, depois autorizacao
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
