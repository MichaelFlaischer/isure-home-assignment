using server.Services;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicyName = "AllowFlaischerFlowOrigins";

builder.Services.AddControllers();
builder.Services.AddSingleton<TodoCosmosService>();

builder.Services.AddCors(options =>
    options.AddPolicy(CorsPolicyName, policy =>
        policy.WithOrigins(
                "http://localhost:4200",
                "https://flaischerflow-web.azurestaticapps.net"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Keep HTTPS redirection enabled; comment out locally if Angular dev tooling requires pure HTTP.
app.UseHttpsRedirection();

app.UseCors(CorsPolicyName);

app.UseAuthorization();

app.MapControllers();

app.Run();
