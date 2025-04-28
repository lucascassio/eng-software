using Microsoft.EntityFrameworkCore;
using ApiTrocaLivros.Data;
using ApiTrocaLivros.Services;
using ApiTrocaLivros.Security;
using System.Text;
using ApiTrocaLivros.DTOs;
using Microsoft.IdentityModel.Tokens;
using DotNetEnv;

DotNetEnv.Env.Load(); // Carregar variáveis de ambiente

var builder = WebApplication.CreateBuilder(args);

// Configurações
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração CORS para permitir o frontend na porta 5173
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:5173") // URL do frontend React
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

// Banco de dados
var connectionString = builder.Configuration.GetConnectionString("PostgreSQL");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("A string de conexão para o banco de dados PostgreSQL não foi configurada.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Registro dos serviços    
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<BookService>();
builder.Services.AddScoped<TradeService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<RatingService>();

builder.Services.AddHttpContextAccessor();

var jwtService = new JwtService();
jwtService.ConfigureJwtAuthentication(builder.Services);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

app.UseHttpsRedirection();

// Aplicar o CORS antes de Authentication e Authorization
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();